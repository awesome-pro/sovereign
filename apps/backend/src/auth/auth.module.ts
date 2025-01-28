import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service.js';
import { AuthResolver } from './resolvers/auth.resolver.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { TwoFactorAuthService } from './services/two-factor-auth.service.js';
import { SecurityService } from './services/security.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PermissionService } from './services/permission.service.js';
import { RoleService } from './services/role.service.js';
import { RoleResolver } from './resolvers/role.resolver.js';
import { PermissionsGuard } from './guards/permissions.guard.js';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    LocalStrategy,
    PrismaService,
    TwoFactorAuthService,
    SecurityService,
    PermissionService,
    RoleService,
    RoleResolver,
    PermissionsGuard,
  ],
  exports: [
    AuthService, 
    TwoFactorAuthService, 
    SecurityService, 
    PermissionService,
    RoleService,
  ],
})
export class AuthModule {}
