export type PermissionAction = 
  'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | // Base actions
  'MANAGE' | 'APPROVE' | 'EXECUTE';       // Custom actions

export interface ResourcePermission {
  resourceCode: string;
  actions: PermissionAction[];
}

export const ACTION_FLAGS = {
  VIEW: 0x0001,
  CREATE: 0x0002,
  EDIT: 0x0004,
  DELETE: 0x0008,
  MANAGE: 0x0010,
  APPROVE: 0x0020,
  EXECUTE: 0x0040,
} as const;

export function calculateRequiredMask(actions: PermissionAction[]): number {
  return actions.reduce((mask, action) => {
    const flag = ACTION_FLAGS[action];
    if (!flag) throw new Error(`Invalid permission action: ${action}`);
    return mask | flag;
  }, 0);
}

export function parseHexString(hex: string): number {
  if (!/^0x[0-9A-Fa-f]+$/.test(hex)) {
    throw new Error(`Invalid permission format: ${hex}`);
  }
  return parseInt(hex, 16);
}

export function hasPermission(userPermissions: Record<string, string>, requirement: ResourcePermission): boolean {
  const userPermissionHex = userPermissions[requirement.resourceCode];
  if (!userPermissionHex) return false;

  try {
    const userMask = parseHexString(userPermissionHex);
    const requiredMask = calculateRequiredMask(requirement.actions);
    return (userMask & requiredMask) === requiredMask;
  } catch (error) {
    console.error('Permission validation error:', error);
    return false;
  }
}
