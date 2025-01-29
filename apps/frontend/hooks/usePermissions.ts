"use client"

import { useCallback } from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import { ROLE_PERMISSIONS } from '@/config/auth.config';
import type { User } from '@/types';

export function usePermissions() {
  const { user } = useAuthContext();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    // Get all permissions from user's roles
    const userPermissions = user?.roles?.reduce((permissions: string[], userRole) => {
      const roleName = userRole?.role?.name;
      const rolePermissions = ROLE_PERMISSIONS[roleName] || [];
      return [...permissions, ...rolePermissions];
    }, []);

    return userPermissions?.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const getUserRole = useCallback((user: User): string => {
    if (!user?.roles || user?.roles?.length === 0) return '';
    return user?.roles[0]?.role?.name || '';
  }, []);

  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  }, [user, getUserRole]);

  const isCompanyAdmin = useCallback((): boolean => {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'COMPANY_ADMIN';
  }, [user, getUserRole]);

  const isAgent = useCallback((): boolean => {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'AGENT';
  }, [user, getUserRole]);

  const isBroker = useCallback((): boolean => {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'BROKER';
  }, [user, getUserRole]);

  const isPropertyManager = useCallback((): boolean => {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'PROPERTY_MANAGER';
  }, [user, getUserRole]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    isAdmin,
    isCompanyAdmin,
    isAgent,
    isBroker,
    isPropertyManager,
  };
}
