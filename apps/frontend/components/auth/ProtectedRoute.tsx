"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { usePermissions } from '@/hooks/usePermissions';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: string[];
  requireAll?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permissions = [],
  requireAll = true,
  redirectTo = '/auth/sign-in',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
      return;
    }

    if (!isLoading && user && permissions.length > 0) {
      const hasPermission = requireAll
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

      if (!hasPermission) {
        toast.error('You do not have permission to access this page');
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, permissions, requireAll, hasAllPermissions, hasAnyPermission, router, redirectTo]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (permissions.length > 0) {
    const hasPermission = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasPermission) {
      return null;
    }
  }

  return <>{children}</>;
}
