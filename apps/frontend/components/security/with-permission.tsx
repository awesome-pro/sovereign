// components/security/with-permission.tsx
import { ReactElement, ComponentType } from 'react';
import { useSecurity } from '@/contexts/security-context';

export function withPermission<T extends object>(
  WrappedComponent: ComponentType<T>,
  options: {
    any?: string[];
    all?: string[];
    fallback?: ReactElement;
  }
) {
  return function ComponentWithPermission(props: T) {
    const { permissions, loading } = useSecurity();

    if (loading) return <div className="security-skeleton" />;

    let hasAccess = true;
    
    if (options.any) {
      hasAccess = options.any.some(p => permissions.has(p));
    }

    if (options.all) {
      hasAccess = options.all.every(p => permissions.has(p));
    }

    return hasAccess ? <WrappedComponent {...props} /> : options.fallback || null;
  };
}

