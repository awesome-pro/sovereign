// src/guards/sensitive-action.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SENSITIVE_KEY } from '../decorators/rbac.decorator.js';
import { UltraSecureJwtPayload } from '../services/auth.interfaces.js';
import { PermissionService } from '../services/permission.service.js';

@Injectable()
export class SensitiveActionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    //private readonly rolesService: RolesService,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSensitive = this.reflector.getAllAndOverride<boolean>(SENSITIVE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // If the endpoint isn’t marked as sensitive, allow access
    if (!isSensitive) {
      return true;
    }
    
    const ctx = GqlExecutionContext.create(context);
    const user: UltraSecureJwtPayload = ctx.getContext().req.user;
    if (!user || !user.sb) {  // Assuming `sb` is the user ID
      return false;
    }
    
    // For sensitive actions, fetch the current roles and permissions from the DB
    //const currentRoles = await this.rolesService.getUserRoles(user.sb);
    const currentPermissions = await this.permissionService.getUserPermissions(user.sb);
    
    // Compare the token's permissions with current permissions.
    // You might want to do a more detailed check here. For demonstration,
    // we verify that every permission in the token is still valid.
    const tokenPermissions: string[] = user.p || [];
    const valid = tokenPermissions.every(perm => currentPermissions.includes(perm));
    return valid;
  }
}
