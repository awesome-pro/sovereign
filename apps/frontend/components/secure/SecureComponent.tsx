// apps/frontend/components/secure/SecureComponent.tsx
import React from 'react';
import { useAuthContext } from '@/providers/auth-provider';
import { RequiredPermission } from '@/utils/permissions';

interface SecureComponentProps {
  component: React.ComponentType<any>;
  permissions?: RequiredPermission[];
  roles?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function SecureComponent({
  component: Component,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null
}: SecureComponentProps) {
  const { hasPermission, hasRole, isLoading, isInitialized } = useAuthContext();
  const [mounted, setMounted] = React.useState(false);

  // Handle client-side mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show nothing while loading
  if (isLoading || !isInitialized) {
    return null;
  }

  // Check permissions and roles
  const hasRequiredPermissions = permissions.length === 0 || hasPermission(permissions, requireAll);
  const hasRequiredRoles = roles.length === 0 || (
    requireAll 
      ? roles.every(r => hasRole(r))
      : roles.some(r => hasRole(r))
  );

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return fallback;
  }

  return <Component />;
}