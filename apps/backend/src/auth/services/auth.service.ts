import { PermissionService } from './permission.service.js';
import { RoleService } from './role.service.js';
import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User as PrismaUser, UserStatus, PermissionCategory } from '@sovereign/database';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../prisma/prisma.service.js';
import { LoggerService } from '../../logging/logging.service.js';
import { RegisterInput } from '../dto/auth.input.js';
import { AuthResponse, User, UserSession, VerificationResponse } from '../types/auth.types.js';
import { mapPrismaUserToGraphQL } from '../utils/type-mappers.js';
import { UltraSecureJwtPayload } from './auth.interfaces.js';
import { SessionService } from '../session/session.service.js';

interface DeviceInfo {
  ip?: string;
  device?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private permissionService: PermissionService,
    private roleService: RoleService,
    private sessionService: SessionService, // Assuming SessionService is injected
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('AuthService');
  }

  async register(input: RegisterInput, deviceInfo: DeviceInfo): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(input.password);

      // Start transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create user with profile
        const user = await prisma.user.create({
          data: {
            name: input.firstName,
            email: input.email,
            password: hashedPassword,
            phone: input.phone,
            status: UserStatus.PENDING_VERIFICATION,
            profile: {
              create: {
                lastName: input.lastName,
              },
            },
            ...(input.companyId && {
              company: {
                connect: { id: input.companyId },
              },
            }),
          },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: true,
                  },
                },
              },
            },
            profile: true,
            company: true,
          },
        });

        // Assign default role based on registration type
        const defaultRole = input.companyId ? 'AGENT' : 'USER';
        const role = await prisma.role.findUnique({
          where: { name: defaultRole },
        });

        if (!role) {
          throw new Error(`Default role ${defaultRole} not found`);
        }

        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });

        return user;
      });

      const newSession = await this.sessionService.createSession(result.id, deviceInfo);

      // Generate tokens
      const accessToken = await this.createAccessToken(result, newSession, deviceInfo);
      const refreshToken = await this.createRefreshToken(result, deviceInfo);

      // Log security event
      await this.logSecurityEvent(result.id, 'REGISTER', {
        description: 'User registration',
        ...deviceInfo,
      });

      return {
        accessToken,
        refreshToken,
        user: mapPrismaUserToGraphQL(result),
      };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw error;
    }
  }

  async login(user: PrismaUser, deviceInfo: DeviceInfo): Promise<AuthResponse> {
    try {
      // Create a new session
      const session = await this.sessionService.createSession(user.id, deviceInfo);

      // Create access token with session info
      const accessToken = await this.createAccessToken(user, session, deviceInfo);
      const refreshToken = session.refreshToken ?? uuidv4();

      // Log successful login
      await this.logLoginAttempt(user.id, true, deviceInfo);

      return {
        accessToken,
        refreshToken,
        user: mapPrismaUserToGraphQL(user),
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async refreshToken(token: string, deviceInfo: DeviceInfo): Promise<AuthResponse> {
    try {
      // Find the refresh token in the database
      const refreshTokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          hashedToken: await bcrypt.hash(token, 10),
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!refreshTokenRecord) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Check if user is still active
      if (refreshTokenRecord.user.status !== UserStatus.ACTIVE) {
        await this.revokeAllUserTokens(refreshTokenRecord.user.id);
        throw new UnauthorizedException('User account is not active');
      }

      // Revoke the used refresh token (one-time use)
      await this.revokeRefreshToken(refreshTokenRecord.id);

      // get the user session, having the refresh token
      const session = await this.prisma.userSession.findFirst({
        where: { refreshToken: token, userId: refreshTokenRecord.userId },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new tokens
      const accessToken = await this.createAccessToken(refreshTokenRecord.user, session, deviceInfo);
      const newRefreshToken = await this.createRefreshToken(refreshTokenRecord.user, deviceInfo);

      // Log the token refresh
      await this.logSecurityEvent(refreshTokenRecord.user.id, 'TOKEN_REFRESH', {
        description: 'Refresh token used to generate new tokens',
        ...deviceInfo,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: mapPrismaUserToGraphQL(refreshTokenRecord.user),
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<PrismaUser> {
    try {
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

      if (!user || user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
        throw new UnauthorizedException('Invalid credentials or inactive account');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return user;
    } catch (error) {
      this.logger.error('User validation failed', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<VerificationResponse> {
    try {
      // Verify token and get user
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user status
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          status: UserStatus.ACTIVE,
        },
      });

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      this.logger.error('Email verification failed', error);
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }
  }

  async requestPasswordReset(email: string): Promise<VerificationResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: true, // Return true for security
          message: 'If your email is registered, you will receive a password reset link',
        };
      }

      // Generate reset token
      const token = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '1h' },
      );

      // TODO: Send reset email with token

      return {
        success: true,
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      this.logger.error('Password reset request failed', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<VerificationResponse> {
    try {
      // Verify token
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update password
      const hashedPassword = await this.hashPassword(newPassword);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Revoke all refresh tokens
      await this.revokeAllUserTokens(user.id);

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      this.logger.error('Password reset failed', error);
      return {
        success: false,
        message: 'Invalid or expired reset token',
      };
    }
  }

  async createAccessToken(
    user: PrismaUser, 
    session: UserSession,
    deviceInfo: DeviceInfo
  ): Promise<string> {
    try {
      // Get user permissions
      const permissions = await this.permissionService.getUserPermissions(user.id);
      
      const roles = await this.prisma.userRole.findMany({
        where: { userId: user.id },
        include: { role: true },
      });

      const payload: Omit<UltraSecureJwtPayload, 'iat' | 'exp'> = {
        sub: user.id,
        rls: roles.map((r) => r.role.name),
        brn: user.companyId || '', // Use actual company/brokerage ID
        iss: this.configService.get<string>('JWT_ISSUER') || 'sovereign-crm',
        sctx: {
          iph: session.ipHash || '',
          dfp: session.deviceHash || '',
          geo: session.location || '',
          uah: crypto.createHash('sha256').update(deviceInfo.userAgent || '').digest('hex')
        },
        prv: permissions,
        cnd: [],
        sec: {
          mfa: user.twoFactorEnabled,
          bio: false, // Update if biometric auth is implemented
          dpl: 1,
          rsk: 0
        },
        jti: session.id // Use session ID as JWT ID
      };

      // Sign the token with explicit expiration
      return this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
      });
    } catch (error) {
      this.logger.error('Error creating access token', error);
      throw error;
    }
  }

  async createRefreshToken(user: PrismaUser, deviceInfo?: DeviceInfo): Promise<string> {
    try {
      const token = uuidv4();
      const hashedToken = await bcrypt.hash(token, 10);
      const expiresIn = this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN') || 7 * 24 * 60 * 60 * 1000; // 7 days default

      // Cleanup old refresh tokens
      await this.cleanupOldRefreshTokens(user.id);

      await this.prisma.refreshToken.create({
        data: {
          hashedToken,
          userId: user.id,
          device: deviceInfo?.device,
          ip: deviceInfo?.ip,
          expiresAt: new Date(Date.now() + expiresIn),
        },
      });

      return token;
    } catch (error) {
      this.logger.error('Error creating refresh token', error);
      throw error;
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.update({
        where: { id: tokenId },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error revoking refresh token', error);
      throw error;
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.logger.error('Error revoking all user tokens', error);
      throw error;
    }
  }

  async logLoginAttempt(userId: string, success: boolean, deviceInfo: DeviceInfo): Promise<void> {
    try {
      await this.prisma.loginHistory.create({
        data: {
          userId,
          success,
          device: deviceInfo?.device,
          ip: deviceInfo?.ip,
          reason: success ? 'Successful login' : 'Invalid credentials',
        },
      });
    } catch (error) {
      this.logger.error('Error logging login attempt', error);
    }
  }

  async logSecurityEvent(userId: string, action: string, details: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error logging security event', error);
    }
  }

  async assignRoleToUser(userId: string, roleId: string, assignedBy: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if role exists
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Check if user already has this role
      const existingRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (existingRole) {
        throw new ConflictException('User already has this role');
      }

      // Assign role
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
          assignedBy,
        },
      });

      // Invalidate user's permission cache
      await this.permissionService.invalidateUserPermissions(userId);

      // Log the role assignment
      await this.logSecurityEvent(userId, 'ROLE_ASSIGNED', {
        description: `Role ${role.name} assigned to user`,
        assignedBy,
      });
    } catch (error) {
      this.logger.error('Error assigning role to user', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string, removedBy: string): Promise<void> {
    try {
      // Check if the role assignment exists
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: {
          role: true,
        },
      });

      if (!userRole) {
        throw new NotFoundException('User does not have this role');
      }

      // Prevent removing the last role
      const userRoles = await this.prisma.userRole.count({
        where: { userId },
      });

      if (userRoles === 1) {
        throw new ForbiddenException('Cannot remove the last role from user');
      }

      // Remove role
      await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      // Invalidate user's permission cache
      await this.permissionService.invalidateUserPermissions(userId);

      // Log the role removal
      await this.logSecurityEvent(userId, 'ROLE_REMOVED', {
        description: `Role ${userRole.role.name} removed from user`,
        removedBy,
      });
    } catch (error) {
      this.logger.error('Error removing role from user', error);
      throw error;
    }
  }

  async logout(userId: string, sessionId?: string): Promise<boolean> {
    try {
      if (sessionId) {
        // Revoke specific session
        await this.sessionService.revokeSession(sessionId);
      } else {
        // Revoke all sessions
        await this.sessionService.revokeAllUserSessions(userId);
      }
      return true;
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 12);
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw error;
    }
  }

  private async cleanupOldRefreshTokens(userId: string): Promise<void> {
    try {
      const maxTokensPerUser = this.configService.get<number>('MAX_REFRESH_TOKENS_PER_USER') || 5;

      // Get all active tokens for the user
      const activeTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId,
          revokedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // If we have more tokens than allowed, revoke the oldest ones
      if (activeTokens.length >= maxTokensPerUser) {
        const tokensToRevoke = activeTokens.slice(maxTokensPerUser - 1);
        await Promise.all(
          tokensToRevoke.map((token) =>
            this.prisma.refreshToken.update({
              where: { id: token.id },
              data: { revokedAt: new Date() },
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error('Error cleaning up old refresh tokens', error);
    }
  }

  private generateContextualConditions(user: User): string[] {
    const conditions: string[] = [];
    
    // Add role-based conditions
    if (user.roles.some(r => r.role.name === 'BROKER')) {
      conditions.push('MAX_DEAL_VALUE:10000000');
    }
    
    // Add status-based conditions
    if (user.status === UserStatus.SUSPENDED) {
      conditions.push('REQUIRES_APPROVAL');
    }
    
    // Add security-based conditions
    if (user.twoFactorEnabled) {
      conditions.push('MFA_REQUIRED');
    }
    
    return conditions;
  }
}
