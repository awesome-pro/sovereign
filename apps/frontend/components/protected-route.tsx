"use client";

import { useRBAC } from '@/providers/rbac-provider';
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
  hierarchyCheck?: boolean;
  fallbackUrl?: string;
  showLoading?: boolean;
  LoadingComponent?: React.ComponentType;
  UnauthorizedComponent?: React.ComponentType;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermissions,
  hierarchyCheck = true,
  fallbackUrl = '/unauthorized',
  showLoading = true,
  LoadingComponent,
  UnauthorizedComponent,
}: ProtectedRouteProps) => {
  const { checkHierarchicalRole, hasAllPermissions, isLoading: isRbacLoading } = useRBAC();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const validateAccess = async () => {
      if (!isAuthenticated) {
        if (mounted) setIsAuthorized(false);
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      try {
        let hasAccess = true;

        // Role-based check
        if (requiredRole) {
          hasAccess = await checkHierarchicalRole(requiredRole, { 
            checkValidityPeriod: hierarchyCheck 
          });
        }

        // Permission-based check
        if (hasAccess && requiredPermissions?.length) {
          hasAccess = await hasAllPermissions(requiredPermissions);
        }

        if (mounted) {
          setIsAuthorized(hasAccess);
          if (!hasAccess) {
            toast.error('You do not have permission to access this page');
            router.push(`${fallbackUrl}?reason=insufficient_privileges&from=${pathname}`);
          }
        }
      } catch (error) {
        console.error('Access validation error:', error);
        if (mounted) {
          setIsAuthorized(false);
          toast.error('Failed to validate access permissions');
          router.push(`${fallbackUrl}?reason=validation_error&from=${pathname}`);
        }
      }
    };

    validateAccess();

    return () => {
      mounted = false;
    };
  }, [
    isAuthenticated,
    requiredRole,
    requiredPermissions,
    checkHierarchicalRole,
    hasAllPermissions,
    pathname,
    router,
    fallbackUrl,
    hierarchyCheck
  ]);

  // Show loading state
  if ((isAuthLoading || isRbacLoading || isAuthorized === null) && showLoading) {
    if (LoadingComponent) {
      return <LoadingComponent />;
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show unauthorized state
  if (isAuthorized === false) {
    if (UnauthorizedComponent) {
      return <UnauthorizedComponent />;
    }
    return null;
  }

  // Show authorized content
  return <>{children}</>;
};