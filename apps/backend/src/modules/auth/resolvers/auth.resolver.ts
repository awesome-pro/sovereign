import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { TwoFactorAuthService } from '../services/two-factor-auth.service';
import { SecurityService } from '../services/security.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import type { User } from '@sovereign/database';
import {
  AuthResponse,
  TwoFactorResponse,
  SecurityLog,
  LoginHistory,
} from '../types/auth.types';
import {
  LoginInput,
  RefreshTokenInput,
  TwoFactorTokenInput,
  SecurityLogsInput,
  LoginHistoryInput,
} from '../dto/auth.input';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private twoFactorAuthService: TwoFactorAuthService,
    private securityService: SecurityService,
  ) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') { email, password, twoFactorToken }: LoginInput,
    @Context() context: any,
  ): Promise<AuthResponse> {
    const { req } = context;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Check for account lockout
    const canLogin = await this.securityService.checkLoginAttempts(email, ip);
    if (!canLogin) {
      throw new Error('Account temporarily locked. Please try again later.');
    }

    // Validate credentials
    const user = await this.authService.validateUser(email, password);

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        throw new Error('Two-factor authentication token required');
      }
      const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
        user.id,
        twoFactorToken,
      );
      if (!isValid) {
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
      // You might want to require additional verification or notify the user
      console.log('Suspicious activity detected');
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

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('input') { refreshToken }: RefreshTokenInput,
  ): Promise<AuthResponse> {
    const accessToken = await this.authService.refreshAccessToken(refreshToken);
    return { accessToken };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async logout(
    @CurrentUser() user: User,
    @Args('refreshToken') refreshToken: string,
  ): Promise<boolean> {
    await this.authService.revokeRefreshToken(refreshToken);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TwoFactorResponse)
  async setupTwoFactor(@CurrentUser() user: User): Promise<TwoFactorResponse> {
    return this.twoFactorAuthService.generateTwoFactorSecret(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async verifyAndEnableTwoFactor(
    @CurrentUser() user: User,
    @Args('input') { token }: TwoFactorTokenInput,
  ): Promise<boolean> {
    const isValid = await this.twoFactorAuthService.verifyTwoFactorToken(
      user.id,
      token,
    );
    if (isValid) {
      await this.twoFactorAuthService.enableTwoFactor(user.id);
      return true;
    }
    return false;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async disableTwoFactor(
    @CurrentUser() user: User,
    @Args('password') password: string,
  ): Promise<boolean> {
    await this.authService.validateUser(user.email, password);
    await this.twoFactorAuthService.disableTwoFactor(user.id);
    return true;
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Query(() => [SecurityLog])
  async getSecurityLogs(
    @Args('input') { userId, startDate, endDate }: SecurityLogsInput,
  ): Promise<SecurityLog[]> {
    // Implement security logs query
    return [];
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [LoginHistory])
  async getLoginHistory(
    @CurrentUser() user: User,
    @Args('input') { limit }: LoginHistoryInput,
  ): Promise<LoginHistory[]> {
    // Implement login history query
    return [];
  }
}
