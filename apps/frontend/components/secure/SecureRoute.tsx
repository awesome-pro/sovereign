// apps/frontend/components/secure/SecureRoute.tsx
import { ReactNode } from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import EstateLoading from '@/components/loading';

interface SecureRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function SecureRoute({
  children,
  roles = [],
  permissions = [],
  requireAll = false,
  fallback = <EstateLoading />
}: SecureRouteProps) {
  const { hasRole, hasPermission, isAuthenticated, isInitialized } = useAuthContext();

  if (!isInitialized) {
    return fallback;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  const hasRequiredRoles = roles.length === 0 || (
    requireAll
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role))
  );

  const hasRequiredPermissions = permissions.length === 0 || (
    requireAll
      ? permissions.every(perm => hasPermission(perm))
      : permissions.some(perm => hasPermission(perm))
  );

  if (!hasRequiredRoles || !hasRequiredPermissions) {
    return fallback;
  }

  return <>{children}</>;
}