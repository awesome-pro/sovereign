import { createParamDecorator, ExecutionContext, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UltraSecureJwtPayload } from '../services/auth.interfaces.js';
import { CompleteUser, User } from '../types/auth.types.js';
import { PrismaService } from '../../prisma/prisma.service.js';

type UserKey = keyof (User & CompleteUser);

/**
 * Decorator to get the current authenticated user from the request context
 * Handles both GraphQL and REST contexts
 * Validates and transforms the JWT payload into a proper user object
 */
export const CurrentUser = createParamDecorator(
  async (data: UserKey | undefined, context: ExecutionContext) => {
    try {
      // Get request context
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;

      // Get JWT payload
      const jwtPayload = request.user as UltraSecureJwtPayload;
      if (!jwtPayload?.sb) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      // Get PrismaService instance
      const prisma = request.prismaService as PrismaService;
      if (!prisma) {
        throw new InternalServerErrorException('Database service not available');
      }

      // Load full user data with roles and permissions
      const user = await prisma.user.findUnique({
        where: { id: jwtPayload.sb },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                }
              }
            }
          },
          profile: true,
          company: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Validate user status
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }

      // Extract and flatten permissions from roles
      const permissions = new Set<string>();
      user.roles.forEach(userRole => {
        userRole.role.permissions.forEach(permission => {
          permissions.add(permission.slug);
        });
      });

      // Map roles to JWTRole format
      const mappedRoles = user.roles.map(userRole => ({
        roleHash: userRole.role.roleHash,
        hierarchy: userRole.role.hierarchy,
        parentRoleHash: userRole.role.parentRoleId || null,
      }));

      // Create GraphQL-compatible user object
      const enhancedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        status: user.status,
        roles: mappedRoles,
        permissions: Array.from(permissions), // Convert Set to array
        twoFactorEnabled: user.twoFactorEnabled,
      };

      // Enhance user object with security context
      // const enhancedUser = {
      //   ...graphqlUser,
      // };

      // Return specific property if requested
      if (data) {
        if (data in enhancedUser) {
          return enhancedUser[data as keyof typeof enhancedUser];
        }
        throw new InternalServerErrorException(`Property ${String(data)} not found in user object`);
      }

      return enhancedUser;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Error processing user context');
    }
  },
);

/**
 * Helper method to check if user has specific permissions
 * Checks both direct permissions and role-based permissions
 */
export function hasPermission(user: User | CompleteUser, requiredPermission: string): boolean {
  // Check effective permissions from JWT
  if ('effectivePermissions' in user && Array.isArray(user.effectivePermissions)) {
    if (user.effectivePermissions.includes(requiredPermission)) {
      return true;
    }
  }

  // Check role-based permissions
  return user.permissions.includes(requiredPermission);
}

/**
 * Helper method to check security level requirements
 */
export function hasSecurityLevel(user: any, requiredLevel: number): boolean {
  return user.securityLevel >= requiredLevel;
}

/**
 * Helper method to validate security context
 */
export function validateSecurityContext(user: any, context: any): boolean {
  if (!user.securityContext) return false;
  
  return (
    user.securityContext.deviceFingerprint === context.deviceFingerprint &&
    user.securityContext.ipHash === context.ipHash
  );
}