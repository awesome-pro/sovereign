/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
// import type { User } from '@sovereign/database';
import { LoggerService } from '../../logging/logging.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  TwoFactorTokenInput,
  SecurityLogsInput,
  LoginHistoryInput,
  ResetPasswordInput,
  AssignRoleInput,
} from '../dto/auth.input.js';
import { GqlAuthGuard } from '../guards/gql-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { AuthService } from '../services/auth.service.js';
import { SecurityService } from '../services/security.service.js';
import { TwoFactorAuthService } from '../services/two-factor-auth.service.js';
import {
  AuthResponse,
  TwoFactorResponse,
  SecurityLog,
  LoginHistory,
  VerificationResponse,
  User,
  AuthServiceResponse,
} from '../types/auth.types.js';
import { PermissionsGuard } from '../guards/permissions.guard.js';
import { SessionService } from '../session/session.service.js';
import { Public } from '../decorators/public.decorator.js';
import { Permissions, Roles } from '../decorators/rbac.decorator.js';

@Resolver()
export class AuthResolver {
  private readonly logger: LoggerService;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private twoFactorAuthService: TwoFactorAuthService,
    private securityService: SecurityService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('AuthResolver');
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(GqlAuthGuard)
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    try {
      const { req } = context;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      this.logger.debug('Registration attempt', { email: input.email, ip });

      const result = await this.authService.register(input, { ip, userAgent });
      this.logger.debug('Registration successful', { userId: result.user.id });

      return result;
    } catch (error) {
      this.logger.error('Registration failed', error, { email: input.email });
      throw error;
    }
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    try {
      const { req, res } = context;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      this.logger.debug('Login attempt', { email: input.email, ip });

      // Check for account lockout
      const canLogin = await this.securityService.checkLoginAttempts(input.email, ip);
      if (!canLogin) {
        throw new Error('Account temporarily locked. Please try again later.');
      }

      // Validate credentials
      const user = await this.authService.validateUser(input.email, input.password);

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!input.twoFactorToken) {
          throw new Error('Two-factor authentication token required');
        }
        const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
          user.id,
          input.twoFactorToken,
        );
        if (!isValid) {
          throw new Error('Invalid two-factor authentication token');
        }
      }

      // Generate tokens
      const result: AuthServiceResponse = await this.authService.login(user, { ip, userAgent });

      // Set secure httpOnly cookies with enhanced security
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
        // domain: process.env.COOKIE_DOMAIN,
        // signed: true
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        // domain: process.env.COOKIE_DOMAIN,
        // signed: true
      });

      // Set encrypted token count cookie
      const encryptedCount = await this.authService.encryptTokenCount(2); // 2 tokens present
      res.cookie('tokenCount', 2, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
        // domain: process.env.COOKIE_DOMAIN
      });

      this.logger.debug('Login successful', { userId: user.id });
      

      return { user: result.user, accessTokenExpiry: Date.now() + 15 * 60 * 1000 }
    } catch (error) {
      this.logger.error('Login failed', error, { email: input.email });
      throw error;
    }
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
    @Context() context: any,
  ): Promise<AuthResponse> {
    try {
      const { req, res } = context;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const authResponse = await this.authService.refreshToken(refreshToken, { ip, userAgent });
      
      res.cookie('accessToken', authResponse.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 15 * 60 * 1000,
        // domain: process.env.COOKIE_DOMAIN,
        // signed: true
      });

      res.cookie('refreshToken', authResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        // domain: process.env.COOKIE_DOMAIN,
        // signed: true
      });

      // Update encrypted token count
      const encryptedCount = await this.authService.encryptTokenCount(2);
      res.cookie('tokenCount', 2, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 15 * 60 * 1000,
        // domain: process.env.COOKIE_DOMAIN
      });


      return {
        accessTokenExpiry: Date.now() + 15 * 60 * 1000,
        user: authResponse.user
      }
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async logout(
    @CurrentUser() user: User,
    @Args('refreshToken') refreshToken: string,
    @Context() {req, res}: {req: any; res: any},
  ): Promise<boolean> {
    try {
      await this.authService.revokeRefreshToken(refreshToken);
      
      // Clear all cookies on logout
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        //// domain: process.env.COOKIE_DOMAIN
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        //// domain: process.env.COOKIE_DOMAIN
      });

      res.clearCookie('count', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        //// domain: process.env.COOKIE_DOMAIN
      });

      return true;
    } catch (error) {
      this.logger.error('Logout failed', error, { userId: user.id });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TwoFactorResponse)
  async setupTwoFactor(@CurrentUser() user: User): Promise<TwoFactorResponse> {
    try {
      return await this.twoFactorAuthService.generateTwoFactorSecret(user.id);
    } catch (error) {
      this.logger.error('Failed to set up 2FA', error, { userId: user.id });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async verifyAndEnableTwoFactor(
    @CurrentUser() user: User,
    @Args('input') input: TwoFactorTokenInput,
  ): Promise<boolean> {
    try {
      const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
        user.id,
        input.token,
      );
      if (isValid) {
        await this.twoFactorAuthService.enableTwoFactor(user.id);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to verify and enable 2FA', error, { userId: user.id });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  @Permissions('user.007')
  async assignRole(
    @Args('input') input: AssignRoleInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.authService.assignRoleToUser(
      input.userId,
      input.roleId,
      currentUser.id,
    );
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  @Permissions('user.007')
  async removeRole(
    @Args('userId') userId: string,
    @Args('roleId') roleId: string,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    await this.authService.removeRoleFromUser(userId, roleId, currentUser.id);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [SecurityLog])
  @Permissions('logs.001')
  async getSecurityLogs(
    @Args('input') input: SecurityLogsInput,
  ): Promise<SecurityLog[]> {
    try {
      return await this.securityService.getSecurityLogs(
        input.userId,
        input.startDate,
        input.endDate,
      );
    } catch (error) {
      this.logger.error('Failed to fetch security logs', error, { userId: input.userId });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LoginHistory])
  @Roles('admin')
  // @Permissions('logs.002')
  async getLoginHistory(
    @CurrentUser() user: User,
    @Args('input') input: LoginHistoryInput,
  ): Promise<LoginHistory[]> {
    try {
      return await this.securityService.getLoginHistory(user.id, input.limit);
    } catch (error) {
      this.logger.error('Failed to fetch login history', error, { userId: user.id });
      throw error;
    }
  }

  @Mutation(() => VerificationResponse)
  async verifyEmail(
    @Args('token') token: string,
  ): Promise<VerificationResponse> {
    try {
      return await this.authService.verifyEmail(token);
    } catch (error) {
      this.logger.error('Email verification failed', error);
      throw error;
    }
  }

  @Mutation(() => VerificationResponse)
  async requestPasswordReset(
    @Args('email') email: string,
  ): Promise<VerificationResponse> {
    try {
      return await this.authService.requestPasswordReset(email);
    } catch (error) {
      this.logger.error('Password reset request failed', error, { email });
      throw error;
    }
  }

  @Mutation(() => VerificationResponse)
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<VerificationResponse> {
    try {
      return await this.authService.resetPassword(input.token, input.newPassword);
    } catch (error) {
      this.logger.error('Password reset failed', error);
      throw error;
    }
  }
}
