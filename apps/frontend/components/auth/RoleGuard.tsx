'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/auth/sign-in',
  loadingComponent = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
}: RoleGuardProps) {
  const { user, loading, checkAuth } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!loading) {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push(redirectTo);
          return;
        }

        if (user) {
          const userRoles = user.roles.map((r) => r.role.name);
          const hasAllowedRole = allowedRoles.some((role) => userRoles.includes(role));

          if (!hasAllowedRole) {
            router.push('/unauthorized');
          }
        }
      }
    };

    verifyAuth();
  }, [user, loading, allowedRoles, redirectTo, router, checkAuth]);

  // Show loading state
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // No user means not authenticated
  if (!user) {
    return null;
  }

  // Check if user has required role
  const userRoles = user.roles.map((r) => r.role.name);
  const hasAllowedRole = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}
