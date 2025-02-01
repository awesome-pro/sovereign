// apps/frontend/components/secure/SecureComponent.tsx
import { ComponentType, ReactNode } from 'react';
import { useAuthContext } from '@/providers/auth-provider';

interface SecureComponentProps {
  component: ComponentType<any>;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  props?: any;
}

export function SecureComponent({
  component: Component,
  roles = [],
  permissions = [],
  requireAll = false,
  fallback = null,
  props = {}
}: SecureComponentProps) {
  const { hasRole, hasPermission } = useAuthContext();

  const hasAccess = () => {
    const roleCheck = roles.length === 0 || (
      requireAll
        ? roles.every(role => hasRole(role))
        : roles.some(role => hasRole(role))
    );

    const permissionCheck = permissions.length === 0 || (
      requireAll
        ? permissions.every(perm => hasPermission(perm))
        : permissions.some(perm => hasPermission(perm))
    );

    return roleCheck && permissionCheck;
  };

  return hasAccess() ? <Component {...props} /> : fallback;
}