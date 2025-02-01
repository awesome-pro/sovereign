"use client";

import { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './auth-provider';
import { toast } from 'sonner';

// Enhanced types for better type safety
interface RoleHierarchy {
  id: string;
  name: string;
  parentRoleId: string | null;
  hierarchy: number;
  permissions: string[];
}

interface RBACContextType {
  checkPermission: (permission: string | string[]) => Promise<boolean>;
  checkRole: (role: string | string[]) => Promise<boolean>;
  checkHierarchicalRole: (requiredRole: string, options?: { checkValidityPeriod?: boolean }) => Promise<boolean>;
  hasAnyPermission: (permissions: string[]) => Promise<boolean>;
  hasAllPermissions: (permissions: string[]) => Promise<boolean>;
  getEffectivePermissions: () => Promise<string[]>;
  getEffectiveRoles: () => Promise<string[]>;
  isLoading: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

export function RBACProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [roleHierarchy, setRoleHierarchy] = useState<Record<string, RoleHierarchy>>({});
  const [permissionCache, setPermissionCache] = useState<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch role hierarchy from backend on mount or user change
  useEffect(() => {
    const loadRoleStructure = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/rbac/role-hierarchy', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to load role hierarchy');
        const data = await response.json();
        setRoleHierarchy(data.hierarchy);
      } catch (error) {
        console.error('Failed to load role hierarchy:', error);
        toast.error('Failed to load user permissions. Some features may be restricted.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoleStructure();
  }, [user?.id]);

  // Check cache and validate permission
  const validatePermissionWithCache = useCallback(async (permission: string): Promise<boolean> => {
    const now = Date.now();
    const cached = permissionCache.get(permission);

    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    try {
      const response = await fetch('/api/rbac/validate-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ permission }),
      });

      if (!response.ok) throw new Error('Permission validation failed');
      
      const result = await response.json();
      setPermissionCache(new Map(permissionCache.set(permission, { 
        result: result.hasPermission, 
        timestamp: now 
      })));
      
      return result.hasPermission;
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }, [permissionCache]);

  // Check multiple permissions
  const checkPermission = useCallback(async (requiredPermission: string | string[]): Promise<boolean> => {
    if (!user) return false;
    
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const results = await Promise.all(permissions.map(validatePermissionWithCache));
    return results.every(Boolean);
  }, [user, validatePermissionWithCache]);

  // Enhanced hierarchical role check with caching
  const checkHierarchicalRole = useCallback(async (
    requiredRole: string, 
    options?: { checkValidityPeriod?: boolean }
  ): Promise<boolean> => {
    if (!user || !roleHierarchy) return false;

    const userRoles = user.roles || [];
    
    return userRoles.some(userRole => {
      // Check role validity period if requested
      // if (options?.checkValidityPeriod && userRole.validTo) {
      //   if (new Date(userRole.validTo) < new Date()) {
      //     return false;
      //   }
      // }

      const role = roleHierarchy[userRole.role.id];
      if (!role) return false;

      // Check if the required role is in the hierarchy chain
      let currentRole: RoleHierarchy | undefined = role;
      while (currentRole) {
        if (currentRole.name === requiredRole) return true;
        currentRole = currentRole.parentRoleId ? roleHierarchy[currentRole.parentRoleId] : undefined;
      }

      return false;
    });
  }, [user, roleHierarchy]);

  // Check role (single or multiple)
  const checkRole = useCallback(async (role: string | string[]): Promise<boolean> => {
    const roles = Array.isArray(role) ? role : [role];
    const results = await Promise.all(roles.map(r => checkHierarchicalRole(r)));
    return results.every(Boolean);
  }, [checkHierarchicalRole]);

  // Get effective permissions
  const getEffectivePermissions = useCallback(async (): Promise<string[]> => {
    if (!user || !roleHierarchy) return [];

    const userRoles = user.roles || [];
    const allPermissions = new Set<string>();

    userRoles.forEach(userRole => {
      const role = roleHierarchy[userRole.role.id];
      if (role) {
        role.permissions.forEach(permission => allPermissions.add(permission));
      }
    });

    return Array.from(allPermissions);
  }, [user, roleHierarchy]);

  // Get effective roles
  const getEffectiveRoles = useCallback(async (): Promise<string[]> => {
    if (!user || !roleHierarchy) return [];

    const userRoles = user.roles || [];
    const allRoles = new Set<string>();

    userRoles.forEach(userRole => {
      let currentRole: RoleHierarchy | undefined = roleHierarchy[userRole.role.id];
      while (currentRole) {
        allRoles.add(currentRole.name);
        currentRole = currentRole.parentRoleId ? roleHierarchy[currentRole.parentRoleId] : undefined;
      }
    });

    return Array.from(allRoles);
  }, [user, roleHierarchy]);

  const contextValue = useMemo(() => ({
    checkPermission,
    checkRole,
    checkHierarchicalRole,
    hasAnyPermission: async (permissions: string[]) => {
      const results = await Promise.all(permissions.map(p => checkPermission(p)));
      return results.some(Boolean);
    },
    hasAllPermissions: async (permissions: string[]) => {
      const results = await Promise.all(permissions.map(p => checkPermission(p)));
      return results.every(Boolean);
    },
    getEffectivePermissions,
    getEffectiveRoles,
    isLoading,
  }), [
    checkPermission,
    checkRole,
    checkHierarchicalRole,
    getEffectivePermissions,
    getEffectiveRoles,
    isLoading,
  ]);

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
}

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};
