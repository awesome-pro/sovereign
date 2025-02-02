// apps/frontend/components/secure/SecureComponent.tsx
import React from 'react';
import { useAuthContext } from '@/providers/auth-provider';

interface SecureComponentProps {
  component: React.ComponentType<any>;
  permissions?: string[];
  roles?: string[];
  fallback?: React.ReactNode;
}

export function SecureComponent({
  component: Component,
  permissions = [],
  roles = [],
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
  const hasRequiredPermissions = permissions.length === 0 || permissions.some(p => hasPermission(p));
  const hasRequiredRoles = roles.length === 0 || roles.some(r => hasRole(r));

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return fallback;
  }

  return <Component />;
}