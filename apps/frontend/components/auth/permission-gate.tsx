'use client';

import { ReactNode } from 'react';
import { useAuthContext } from '@/providers/auth-provider';

interface PermissionGateProps {
  children: ReactNode;
  roles?: string | string[];
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  roles,
  fallback = null,
}: PermissionGateProps) {
  const { hasRole } = useAuthContext();

  const hasRequiredRoles = !roles || hasRole(roles);

  if (!hasRequiredRoles) {
    return fallback;
  }

  return <>{children}</>;
}

// Example usage:
// <PermissionGate
//   permissions={['EDIT_PROPERTY']}
//   roles={['ADMIN', 'AGENT']}
//   fallback={<p>Unauthorized</p>}
// >
//   <EditPropertyForm />
// </PermissionGate>
