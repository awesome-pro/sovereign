import { UserStatus } from "@sovereign/database";
import { CompleteUser, Role, User, UserRole } from "../types/auth.types.js";


export function isValidDate(date: any): date is Date {
    return date instanceof Date || (typeof date === 'string' && !isNaN(Date.parse(date)));
  }
  

  /**
 * Type guard for Role
 */
export function isValidRole(role: any): role is Role {
    return (
      typeof role === 'object' &&
      role !== null &&
      typeof role.id === 'string' &&
      typeof role.name === 'string' &&
      Array.isArray(role.permissions) &&
      role.permissions.every((p: any) => typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string')
    );
  }


  /**
 * Type guard for UserRole
 */
export function isValidUserRole(userRole: any): userRole is UserRole {
    return (
      typeof userRole === 'object' &&
      userRole !== null &&
      typeof userRole.id === 'string' &&
      isValidRole(userRole.role) &&
      isValidDate(userRole.assignedAt)
    );
  }



  /**
 * Type guard for User
 */
export function isValidUser(user: any): user is User {
    return (
      typeof user === 'object' &&
      user !== null &&
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      (user.emailVerified === undefined || isValidDate(user.emailVerified)) &&
      (user.phone === undefined || typeof user.phone === 'string') &&
      (user.phoneVerified === undefined || isValidDate(user.phoneVerified)) &&
      typeof user.status === 'string' &&
      Object.values(UserStatus).includes(user.status) &&
      Array.isArray(user.roles) &&
      user.roles.every(isValidUserRole) &&
      typeof user.twoFactorEnabled === 'boolean'
    );
  }

