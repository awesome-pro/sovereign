// components/auth/withPermissions.tsx
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export function withPermissions(
  WrappedComponent: React.ComponentType,
  requiredPermissions: string[],
  options = { redirectTo: '/unauthorized' }
) {
  return function PermissionGuard(props: any) {
    const { hasPermission, isLoading } = useAuthContext();
    const router = useRouter();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    const hasAccess = requiredPermissions.every(p => hasPermission(p));
    if (!hasAccess) {
      router.push(options.redirectTo);
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}