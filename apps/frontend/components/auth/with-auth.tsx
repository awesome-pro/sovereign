'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import { AUTH_CONFIG } from '@/config/auth.config';
import { toast } from 'sonner';

interface WithAuthProps {
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredPermissions = [], requiredRoles = [] }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, hasPermission, hasRole, checkAuth } = useAuthContext();

    useEffect(() => {
      const validateAuth = async () => {
        // Skip auth check for public paths
        if (AUTH_CONFIG.publicPaths.includes(pathname)) {
          return;
        }

        const isAuthed = await checkAuth();
        if (!isAuthed) {
          router.push(AUTH_CONFIG.logoutRedirectPath);
          return;
        }

        // Check permissions if specified
        if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
          toast.error('You do not have permission to access this page');
          router.push('/unauthorized');
          return;
        }

        // Check roles if specified
        if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
          toast.error('You do not have required role to access this page');
          router.push('/unauthorized');
          return;
        }
      };

      validateAuth();
    }, [pathname, isAuthenticated]);

    // Show loading state
    if (isLoading) {
      return <div>Loading...</div>; // Replace with your loading component
    }

    // Show unauthorized state
    if (!isLoading && !isAuthenticated) {
      return null; // Will redirect in useEffect
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };
}

// Example usage:
// export default withAuth(DashboardComponent, {
//   requiredPermissions: ['VIEW_DASHBOARD'],
//   requiredRoles: ['ADMIN', 'COMPANY_ADMIN']
// });
