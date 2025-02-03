// bitmask.service.ts
import { Injectable } from '@nestjs/common';
import { PermissionAction } from '../decorators/rbac.decorator.js';

@Injectable()
export class BitmaskService {
  private readonly ACTION_FLAGS = new Map<PermissionAction, number>([
    ['VIEW', 0x0001],
    ['CREATE', 0x0002],
    ['EDIT', 0x0004],
    ['DELETE', 0x0008],
    ['MANAGE', 0x0010],
    ['APPROVE', 0x0020],
    ['EXECUTE', 0x0040]
  ]);

  calculateRequiredMask(actions: PermissionAction[]): number {
    return actions.reduce((mask, action) => {
      const flag = this.ACTION_FLAGS.get(action);
      if (!flag) throw new Error(`Invalid permission action: ${action}`);
      return mask | flag;
    }, 0);
  }

  hasPermission(userMask: number, requiredMask: number): boolean {
    return (userMask & requiredMask) === requiredMask;
  }

  parseHexString(hex: string): number {
    if (!/^0x[0-9A-Fa-f]{4}$/.test(hex)) {
      throw new Error(`Invalid permission format: ${hex}`);
    }
    return parseInt(hex, 16);
  }
}