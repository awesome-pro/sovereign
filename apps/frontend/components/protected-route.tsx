"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from '@/providers/rbac-provider';
import { useAuthContext } from '@/providers/auth-provider';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  minSecurityLevel?: number;
  requireMfa?: boolean;
  maxRiskScore?: number;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllRoles = false,
  requireAllPermissions = true,
  minSecurityLevel,
  requireMfa,
  maxRiskScore,
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const { 
    checkRole, 
    checkPermission,
    isLoading: isRbacLoading 
  } = useRBAC();

  useEffect(() => {
    const validateAccess = async () => {
      if (!isAuthenticated || !user) {
        toast.error('Please sign in to access this page');
        router.push('/auth/sign-in');
        return;
      }

      try {
        // Check security requirements from JWT
        // if (minSecurityLevel && user.sec?.dpl < minSecurityLevel) {
        //   toast.error('Additional security verification required');
        //   router.push('/auth/security-verification');
        //   return;
        // }

        // if (requireMfa && !user.ss?.mfa) {
        //   toast.error('Two-factor authentication required');
        //   router.push('/auth/mfa');
        //   return;
        // }

        // if (maxRiskScore && user.sec?.rsk > maxRiskScore) {
        //   toast.error('Access denied: Risk score too high');
        //   router.push('/unauthorized?reason=high_risk_score');
        //   return;
        // }

        // Check roles
        if (requiredRoles.length > 0) {
          const hasRoles = requireAllRoles
            ? await checkRole(requiredRoles)
            : (await Promise.all(requiredRoles.map(role => checkRole(role)))).some(Boolean);

          if (!hasRoles) {
            toast.error('Insufficient role permissions');
            router.push('/unauthorized?reason=insufficient_role');
            return;
          }
        }

        // Check permissions
        if (requiredPermissions.length > 0) {
          const hasPermissions = requireAllPermissions
            ? await checkPermission(requiredPermissions)
            : (await Promise.all(requiredPermissions.map(perm => checkPermission(perm)))).some(Boolean);

          if (!hasPermissions) {
            toast.error('Insufficient permissions');
            router.push('/unauthorized?reason=insufficient_permissions');
            return;
          }
        }

      } catch (error) {
        console.error('Access validation error:', error);
        toast.error('Failed to validate access permissions');
        router.push('/unauthorized?reason=validation_error');
      }
    };

    validateAccess();
  }, [
    isAuthenticated,
    user,
    checkRole,
    checkPermission,
    requiredRoles,
    requiredPermissions,
    requireAllRoles,
    requireAllPermissions,
    minSecurityLevel,
    requireMfa,
    maxRiskScore,
    router
  ]);

  if (isAuthLoading || isRbacLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return unauthorizedComponent || null;
  }

  return <>{children}</>;
}