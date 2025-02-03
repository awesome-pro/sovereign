// components/auth/SecureRoute.tsx
import { useAuthContext } from '@/providers/auth-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/token-manager';
import { toast } from 'sonner';
import EstateLoading from '../loading';
import { RequiredPermission } from '@/utils/permissions';

interface SecureRouteProps {
  children: React.ReactNode;
  requiredPermissions?: RequiredPermission[];
  requiredRoles?: string[];
  minSecurityLevel?: number;
}

export function SecureRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  minSecurityLevel = 0,
}: SecureRouteProps) {
  const { user, hasPermission, hasRole, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('Please sign in');
      router.push('/auth/sign-in');
      return;
    }

    const token = TokenManager.getDecodedToken();
    if (token) {
      // Security checks
    //   if (token.sec.dpl < minSecurityLevel) {
    //     router.push('/security-upgrade');
    //     return;
    //   }

      // Role & Permission checks
      const hasRequiredRoles = requiredRoles.every(r => hasRole(r));
      const hasRequiredPermissions = requiredPermissions.every(p => hasPermission(p));

      if (!hasRequiredRoles || !hasRequiredPermissions) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router, hasPermission, hasRole]);

  if (isLoading) {
    return <EstateLoading />;
  }

  return <>{children}</>;
}