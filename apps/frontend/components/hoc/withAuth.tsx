"use client";

// apps/frontend/components/hoc/withAuth.tsx
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/auth-provider';
import EstateLoading from '@/components/loading';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    redirectTo?: string;
    loadingComponent?: React.ComponentType;
  } = {}
) {
  return function WithAuthComponent(props: P) {
    const {
      requireAuth = true,
      redirectTo = '/auth/sign-in',
      loadingComponent: LoadingComponent = EstateLoading,
    } = options;

    const { isAuthenticated, isInitialized, user } = useAuthContext();
    const router = useRouter();

    if (!isInitialized) {
      return <LoadingComponent />;
    }

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return null;
    }

    if (!requireAuth && isAuthenticated) {
      router.push('/dashboard');
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}