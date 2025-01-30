import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Redis } from 'ioredis';

import { PrismaModule } from '../prisma/prisma.module.js';
import { LoggingModule } from '../logging/logging.module.js';
import { AuthService } from './services/auth.service.js';
import { AuthResolver } from './resolvers/auth.resolver.js';
import { RoleService } from './services/role.service.js';
import { RoleResolver } from './resolvers/role.resolver.js';
import { PermissionService } from './services/permission.service.js';
import { PermissionResolver } from './resolvers/permission.resolver.js';
import { SecurityService } from './services/security.service.js';
import { TwoFactorAuthService } from './services/two-factor-auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GqlAuthGuard } from './guards/gql-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { PasswordService } from './password/password.service.js';
import { SessionService } from './session/session.service.js';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    LoggingModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    RoleService,
    RoleResolver,
    PermissionService,
    PermissionResolver,
    SecurityService,
    TwoFactorAuthService,
    JwtStrategy,
    GqlAuthGuard,
    RolesGuard,
    PermissionsGuard,
    {
      provide: Redis,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          keyPrefix: 'auth:',
        });
      },
      inject: [ConfigService],
    },
    PasswordService,
    SessionService,
  ],
  exports: [
    AuthService,
    RoleService,
    PermissionService,
    SecurityService,
    TwoFactorAuthService,
    GqlAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
