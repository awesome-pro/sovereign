import { UserPermission } from '@/types';

export type PermissionAction = 
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'MANAGE'
  | 'APPROVE'
  | 'EXECUTE';

const ACTION_FLAGS: Record<PermissionAction, number> = {
  'VIEW': 0x0001,
  'CREATE': 0x0002,
  'EDIT': 0x0004,
  'DELETE': 0x0008,
  'MANAGE': 0x0010,
  'APPROVE': 0x0020,
  'EXECUTE': 0x0040
};

export interface RequiredPermission {
  resourceCode: string;
  actions: PermissionAction[];
}

export function calculateRequiredMask(actions: PermissionAction[]): number {
  return actions.reduce((mask, action) => {
    const flag = ACTION_FLAGS[action];
    if (!flag) throw new Error(`Invalid permission action: ${action}`);
    return mask | flag;
  }, 0);
}

export function hasPermission(
  userPermissions: UserPermission[],
  required: RequiredPermission | RequiredPermission[],
  requireAll = false
): boolean {
  const requiredArray = Array.isArray(required) ? required : [required];
  
  return requireAll
    ? requiredArray.every(req => checkSinglePermission(userPermissions, req))
    : requiredArray.some(req => checkSinglePermission(userPermissions, req));
}

function checkSinglePermission(
  userPermissions: UserPermission[],
  required: RequiredPermission
): boolean {
  const userPerm = userPermissions.find(p => p.resourceCode === required.resourceCode);
  if (!userPerm) return false;

  const requiredMask = calculateRequiredMask(required.actions);
  return (userPerm.bit & requiredMask) === requiredMask;
}
