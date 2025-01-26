import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '@sovereign/database';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Invalid credentials or inactive account',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled && !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is enabled but not properly set up');
    }

    return user;
  }

  async createAccessToken(user: User): Promise<string> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: roles.map((r) => r.role.name),
    };

    return this.jwtService.sign(payload);
  }

  async createRefreshToken(user: User, deviceInfo?: any): Promise<string> {
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

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
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
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.createAccessToken(tokenRecord.user);
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async logLoginAttempt(
    userId: string,
    success: boolean,
    deviceInfo: any,
  ): Promise<void> {
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
  }

  async logSecurityEvent(
    userId: string,
    action: string,
    details: any,
  ): Promise<void> {
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
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
