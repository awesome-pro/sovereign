import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ResourcePermission } from '../decorators/rbac.decorator.js';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UltraSecureJwtPayload } from '../services/auth.interfaces.js';
import { BitmaskService } from '../services/bitmask.service.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private bitmaskService: BitmaskService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    const requiredPermissions = this.reflector.getAllAndOverride<ResourcePermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    // Extract user from GraphQL context
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user as UltraSecureJwtPayload;

    if (!user) {
        throw new ForbiddenException('Unauthorized');
    }

    // Validate ALL required permissions
    return requiredPermissions.every(requiredPermission => 
      this.validateResourcePermission(user, requiredPermission)
    );
  }

  private validateResourcePermission(
    user: UltraSecureJwtPayload,
    requiredPermission: ResourcePermission
  ): boolean {
    try {
      const userPermission = user.p[requiredPermission.resourceCode];
      
      if (!userPermission) {
        throw new Error(`Missing access to ${requiredPermission.resourceCode}`);
      }

      const requiredMask = this.bitmaskService.calculateRequiredMask(requiredPermission.actions);
      const userMask = this.bitmaskService.parseHexString(userPermission);

      if (!this.bitmaskService.hasPermission(userMask, requiredMask)) {
        throw new Error(`Insufficient permissions for ${requiredPermission.resourceCode}`);
      }

      return true;
    } catch (error: any) {
      throw new ForbiddenException({
        error: 'Permission Denied',
        message: error.message,
        required: `${requiredPermission.resourceCode}:${requiredPermission.actions.join(',')}`
      });
    }
  }
}