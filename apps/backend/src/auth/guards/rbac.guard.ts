// // rbac.guard.ts

// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { PermissionService } from '../services/permission.service.js';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { UnauthorizedException } from '@nestjs/common';

// @Injectable()
// export class RBACGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private permissionService: PermissionService
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const gqlContext = GqlExecutionContext.create(context);
//     const req = gqlContext.getContext().req;
    
//     // 1. Get required access metadata
//     const roles = this.reflector.get<string[]>('roles', context.getHandler());
//     const permissions = this.reflector.get<string[]>('permissions', context.getHandler());
//     const contextCondition = this.reflector.get<string>('contextCondition', context.getHandler());

//     // 2. Verify user context
//     const user = req.user;
//     if (!user) throw new UnauthorizedException();

//     // 3. Check hierarchical roles
//     if (roles) {
//       const hasRole = await this.permissionService.hasHierarchicalRole(
//         user.id,
//         roles,
//         user.riskProfile?.level
//       );
//       if (!hasRole) return false;
//     }

//     // 4. Verify granular permissions
//     if (permissions) {
//       const hasPermissions = await this.permissionService.verifyPermissions(
//         user.id,
//         permissions,
//         gqlContext.getArgs()
//       );
//       if (!hasPermissions) return false;
//     }

//     // 5. Validate contextual conditions (e.g., property value limits)
//     if (contextCondition) {
//       const isValid = await this.permissionService.validateContext(
//         user.id,
//         contextCondition,
//         gqlContext.getArgs()
//       );
//       if (!isValid) return false;
//     }

//     return true;
//   }
// }