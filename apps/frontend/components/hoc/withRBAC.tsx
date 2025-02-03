// apps/frontend/components/hoc/withRBAC.tsx
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { ComponentType, useEffect } from 'react';
import { RequiredPermission } from '@/utils/permissions';

interface RBACOptions {
  requiredRoles?: string[];
  requiredPermissions?: RequiredPermission[];
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  fallbackUrl?: string;
  customFallback?: ComponentType;
}

export function withRBAC<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: RBACOptions = {}
) {
  return function WithRBACComponent(props: P) {
    const {
      requiredRoles = [],
      requiredPermissions = [],
      requireAllRoles = false,
      requireAllPermissions = false,
      fallbackUrl = '/unauthorized',
      customFallback: FallbackComponent,
    } = options;

    const { hasRole, hasPermission, isAuthenticated, isInitialized } = useAuthContext();
    const router = useRouter();

    const checkAccess = () => {
      if (!isAuthenticated) return false;

      const roleCheck = requiredRoles.length === 0 || (
        requireAllRoles
          ? requiredRoles.every(role => hasRole(role))
          : requiredRoles.some(role => hasRole(role))
      );

      const permissionCheck = requiredPermissions.length === 0 || 
        hasPermission(requiredPermissions, requireAllPermissions);

      return roleCheck && permissionCheck;
    };

    useEffect(() => {
      if (isInitialized && !checkAccess()) {
        router.push(fallbackUrl);
      }
    }, [isInitialized]);

    if (!isInitialized) {
      return null;
    }

    if (!checkAccess()) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}