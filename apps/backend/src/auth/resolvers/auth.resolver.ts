import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import type { User } from '@sovereign/database';
import { LoggerService } from '@/logging/logging.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  LoginInput,
  RefreshTokenInput,
  TwoFactorTokenInput,
  SecurityLogsInput,
  LoginHistoryInput,
} from '../dto/auth.input';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import {
  AuthResponse,
  TwoFactorResponse,
  SecurityLog,
  LoginHistory,
} from '../types/auth.types';
import { Roles } from '../decorators/roles.decorator';

@Resolver()
export class AuthResolver {
  private readonly logger: LoggerService;

  constructor(
    private authService: AuthService,
    private twoFactorAuthService: TwoFactorAuthService,
    private securityService: SecurityService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('AuthResolver');
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') { email, password, twoFactorToken }: LoginInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    try {
      const { req } = context;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      this.logger.debug('Login attempt', { email, ip, userAgent });

      // Check for account lockout
      const canLogin = await this.securityService.checkLoginAttempts(email, ip);
      if (!canLogin) {
        this.logger.warn('Account locked', { email, ip });
        throw new Error('Account temporarily locked. Please try again later.');
      }

      // Validate credentials
      const user = await this.authService.validateUser(email, password);

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          this.logger.warn('2FA token required but not provided', {
            userId: user.id,
          });
          throw new Error('Two-factor authentication token required');
        }
        const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
          user.id,
          twoFactorToken,
        );
        if (!isValid) {
          this.logger.warn('Invalid 2FA token', { userId: user.id });
          throw new Error('Invalid two-factor authentication token');
        }
      }

      // Check for suspicious activity
      const isSuspicious = await this.securityService.detectSuspiciousActivity(
        user.id,
        ip,
        userAgent,
      );
      if (isSuspicious) {
        this.logger.warn('Suspicious activity detected', {
          userId: user.id,
          ip,
          userAgent,
        });
      }

      // Generate tokens
      const accessToken = await this.authService.createAccessToken(user);
      const refreshToken = await this.authService.createRefreshToken(user, {
        ip,
        device: userAgent,
      });

      // Log successful login
      await this.authService.logLoginAttempt(user.id, true, {
        ip,
        device: userAgent,
      });

      this.logger.debug('Login successful', { userId: user.id });

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      this.logger.error('Login failed', error, { email });
      throw error;
    }
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('input') { refreshToken }: RefreshTokenInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    try {
      this.logger.debug('Token refresh attempt');
      const accessToken =
        await this.authService.refreshAccessToken(refreshToken);
      return { accessToken };
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
    @Context() context: any,
  ): Promise<boolean> {
    try {
      this.logger.debug('Logout attempt', { userId: user.id });
      await this.authService.revokeRefreshToken(refreshToken);
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
      this.logger.debug('Setting up 2FA', { userId: user.id });
      return this.twoFactorAuthService.generateTwoFactorSecret(user.id);
    } catch (error) {
      this.logger.error('Failed to set up 2FA', error, { userId: user.id });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async verifyAndEnableTwoFactor(
    @CurrentUser() user: User,
    @Args('input') { token }: TwoFactorTokenInput,
  ): Promise<boolean> {
    try {
      this.logger.debug('Verifying and enabling 2FA', { userId: user.id });
      const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
        user.id,
        token,
      );
      if (isValid) {
        await this.twoFactorAuthService.enableTwoFactor(user.id);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to verify and enable 2FA', error, {
        userId: user.id,
      });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async disableTwoFactor(
    @CurrentUser() user: User,
    @Args('password') password: string,
  ): Promise<boolean> {
    try {
      this.logger.debug('Disabling 2FA', { userId: user.id });
      await this.authService.validateUser(user.email, password);
      await this.twoFactorAuthService.disableTwoFactor(user.id);
      return true;
    } catch (error) {
      this.logger.error('Failed to disable 2FA', error, { userId: user.id });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Query(() => [SecurityLog])
  async getSecurityLogs(
    @Args('input') { userId, startDate, endDate }: SecurityLogsInput,
  ): Promise<SecurityLog[]> {
    try {
      this.logger.debug('Fetching security logs', {
        userId,
        startDate,
        endDate,
      });
      const logs = await this.securityService.getSecurityLogs(
        userId,
        startDate,
        endDate,
      );
      return logs;
    } catch (error) {
      this.logger.error('Failed to fetch security logs', error, { userId });
      throw error;
    }
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LoginHistory])
  async getLoginHistory(
    @CurrentUser() user: User,
    @Args('input') { limit }: LoginHistoryInput,
  ): Promise<LoginHistory[]> {
    try {
      this.logger.debug('Fetching login history', { userId: user.id, limit });
      const history = await this.securityService.getLoginHistory(
        user.id,
        limit,
      );
      return history;
    } catch (error) {
      this.logger.error('Failed to fetch login history', error, {
        userId: user.id,
      });
      throw error;
    }
  }
}
