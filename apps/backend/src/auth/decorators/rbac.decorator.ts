// src/decorators/rbac.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const SENSITIVE_KEY = 'sensitive';
export const DUBAI_MARKET_KEY = 'dubai-market';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Permissions = (...perms: string[]) => SetMetadata(PERMISSIONS_KEY, perms);
export const SensitiveAction = () => SetMetadata(SENSITIVE_KEY, true);
export const DubaiMarket = () => SetMetadata(DUBAI_MARKET_KEY, true);