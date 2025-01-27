import { User as PrismaUser, UserRole as PrismaUserRole, Role as PrismaRole } from '@sovereign/database';
import { User, UserRole, Role } from '../types/auth.types.js';

export function mapPrismaUserToGraphQL(prismaUser: PrismaUser & { roles?: (PrismaUserRole & { role: PrismaRole })[] }): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    phone: prismaUser.phone || undefined,
    status: prismaUser.status,
    emailVerified: prismaUser.emailVerified || undefined,
    phoneVerified: prismaUser.phoneVerified || undefined,
    twoFactorEnabled: prismaUser.twoFactorEnabled,
    roles: prismaUser.roles?.map(mapPrismaUserRoleToGraphQL) || [],
  };
}

export function mapPrismaUserRoleToGraphQL(prismaUserRole: PrismaUserRole & { role: PrismaRole }): UserRole {
  return {
    id: prismaUserRole.id,
    role: mapPrismaRoleToGraphQL(prismaUserRole.role),
    assignedAt: prismaUserRole.assignedAt,
  };
}

export function mapPrismaRoleToGraphQL(prismaRole: PrismaRole): Role {
  return {
    id: prismaRole.id,
    name: prismaRole.name,
    description: prismaRole.description || undefined,
    users: [], // This is typically handled by GraphQL resolvers
  };
}
