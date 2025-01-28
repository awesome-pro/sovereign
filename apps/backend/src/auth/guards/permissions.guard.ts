import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService } from '../services/permission.service.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
          PERMISSIONS_KEY,
          [context.getHandler(), context.getClass()],
      );

      if (!requiredPermissions) {
          return true; // No permissions required
      }

      // Extract user from GraphQL context
      const ctx = GqlExecutionContext.create(context);
      const user = ctx.getContext().req.user;

      if (!user) {
          throw new ForbiddenException('Unauthorized');
      }

      const userPermissions = await this.permissionService.getUserPermissions(user.id);

      // Check if user has required permissions
      const hasPermission = requiredPermissions.every((permission) =>
          userPermissions.includes(permission),
      );

      if (!hasPermission) {
          throw new ForbiddenException('Access denied');
      }

      return true;
  }
}
