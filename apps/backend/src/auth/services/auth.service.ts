import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@sovereign/database';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '@/prisma/prisma.service';
import { LoggerService } from '@/logging/logging.service';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('AuthService');
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          profile: true,
          company: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        this.logger.warn('User not found or inactive during validation', {
          email,
        });
        throw new UnauthorizedException(
          'Invalid credentials or inactive account',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn('Invalid password attempt', { email });
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.twoFactorEnabled && !user.twoFactorSecret) {
        this.logger.warn('2FA is enabled but not properly set up', { email });
        throw new UnauthorizedException(
          '2FA is enabled but not properly set up',
        );
      }

      this.logger.debug('User validated successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Error validating user', error, { email });
      throw error;
    }
  }

  async createAccessToken(user: User): Promise<string> {
    try {
      const roles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true },
      });

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: roles.map((r) => r.role.name),
      };

      const token = await this.jwtService.sign(payload);
      this.logger.debug('Access token created', { userId: user.id });
      return token;
    } catch (error) {
      this.logger.error('Error creating access token', error, {
        userId: user.id,
      });
      throw error;
    }
  }

  async createRefreshToken(user: User, deviceInfo?: any): Promise<string> {
    try {
      const token = uuidv4();
      const hashedToken = await bcrypt.hash(token, 10);

      await this.prisma.refreshToken.create({
        data: {
          hashedToken,
          userId: user.id,
          device: deviceInfo?.device,
          ip: deviceInfo?.ip,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      this.logger.debug('Refresh token created', {
        userId: user.id,
        ip: deviceInfo?.ip,
        device: deviceInfo?.device,
      });

      return token;
    } catch (error) {
      this.logger.error('Error creating refresh token', error, {
        userId: user.id,
        ...deviceInfo,
      });
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const hashedToken = await bcrypt.hash(refreshToken, 10);
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { hashedToken },
        include: { user: true },
      });

      if (
        !tokenRecord ||
        tokenRecord.revokedAt ||
        new Date() > tokenRecord.expiresAt
      ) {
        this.logger.warn('Invalid or expired refresh token', { refreshToken });
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const accessToken = await this.createAccessToken(tokenRecord.user);
      this.logger.debug('Access token refreshed', {
        userId: tokenRecord.user.id,
      });
      return accessToken;
    } catch (error) {
      this.logger.error('Error refreshing access token', error, {
        refreshToken,
      });
      throw error;
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
      });
      this.logger.debug('Refresh token revoked', { tokenId });
    } catch (error) {
      this.logger.error('Error revoking refresh token', error, { tokenId });
      throw error;
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      this.logger.debug('All user tokens revoked', { userId });
    } catch (error) {
      this.logger.error('Error revoking all user tokens', error, { userId });
      throw error;
    }
  }

  async logLoginAttempt(
    userId: string,
    success: boolean,
    deviceInfo: any,
  ): Promise<void> {
    try {
      await this.prisma.loginHistory.create({
        data: {
          userId,
          success,
          device: deviceInfo?.device,
          ip: deviceInfo?.ip,
          location: deviceInfo?.location,
          reason: success ? 'Successful login' : 'Invalid credentials',
        },
      });
      this.logger.debug('Login attempt logged', {
        userId,
        success,
        ...deviceInfo,
      });
    } catch (error) {
      this.logger.error('Error logging login attempt', error, {
        userId,
        success,
        ...deviceInfo,
      });
    }
  }

  async logSecurityEvent(
    userId: string,
    action: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.securityLog.create({
        data: {
          userId,
          action,
          description: details.description,
          ip: details.ip,
          device: details.device,
          userAgent: details.userAgent,
        },
      });
      this.logger.debug('Security event logged', {
        userId,
        action,
        ...details,
      });
    } catch (error) {
      this.logger.error('Error logging security event', error, {
        userId,
        action,
        ...details,
      });
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 12);
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw error;
    }
  }
}
