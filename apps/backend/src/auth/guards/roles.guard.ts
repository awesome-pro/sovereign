import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PrismaService } from '../../prisma/prisma.service.js';
import { UltraSecureJwtPayload } from '../services/auth.interfaces.js';
import { ROLES_KEY } from '../decorators/rbac.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user: UltraSecureJwtPayload = ctx.getContext().req.user;

    if (!user) {
      return false;
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.sb },
      include: { role: true },
    });

    const userRoleNames = userRoles.map((ur) => ur.role.roleHash);
    return roles.some((role) => userRoleNames.includes(role));
  }
}
