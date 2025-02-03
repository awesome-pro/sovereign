// src/decorators/rbac.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const SENSITIVE_KEY = 'sensitive';
export const DUBAI_MARKET_KEY = 'dubai-market';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const SensitiveAction = () => SetMetadata(SENSITIVE_KEY, true);
export const DubaiMarket = () => SetMetadata(DUBAI_MARKET_KEY, true);


export type PermissionAction = 
  'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | // Base actions
  'MANAGE' | 'APPROVE' | 'EXECUTE';       // Custom actions

// permissions.decorator.ts
export type ResourcePermission = {
  resourceCode: string;
  actions: PermissionAction[];
};

export const Permissions = (...requirements: ResourcePermission[]) => 
  SetMetadata(PERMISSIONS_KEY, requirements);