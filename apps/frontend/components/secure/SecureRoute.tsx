// apps/frontend/components/secure/SecureRoute.tsx
import { ReactNode } from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import EstateLoading from '@/components/loading';
import { RequiredPermission } from '@/utils/permissions';

interface SecureRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: RequiredPermission[];
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

  const hasRequiredPermissions = permissions.length === 0 || hasPermission(permissions, requireAll);

  if (!hasRequiredRoles || !hasRequiredPermissions) {
    return fallback;
  }

  return <>{children}</>;
}