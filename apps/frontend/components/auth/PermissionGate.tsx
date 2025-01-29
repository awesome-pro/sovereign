"use client"

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permissions = [],
  requireAll = true,
  fallback = null,
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  if (!permissions.length) {
    return <>{children}</>;
  }

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
