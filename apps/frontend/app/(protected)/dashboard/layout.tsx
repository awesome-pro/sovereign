"use client";

import { useEffect } from 'react';
import { useRBAC } from '@/providers/rbac-provider';
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { checkHierarchicalRole, hasAllPermissions, isLoading: isRbacLoading } = useRBAC();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const validateDashboardAccess = async () => {
      if (!isAuthenticated || !user) {
        toast.error('Please sign in, to access the dashboard');
        //router.push(`/auth/sign-in?returnUrl=${encodeURIComponent(pathname || '/dashboard')}`);
        return;
      }

      try {
        // Check if user has any of the required roles for dashboard
        const hasValidRole = await checkHierarchicalRole('ADMIN') ||
                           await checkHierarchicalRole('MANAGER') ||
                           await checkHierarchicalRole('AGENT') ||
                           await checkHierarchicalRole('USER');

        if (!hasValidRole && mounted) {
          toast.error('You do not have permission to access the dashboard');
          router.push('/unauthorized?reason=insufficient_role');
          return;
        }

        // Check minimum security requirements
        // if (user.sec?.dpl < 2) { // Minimum data protection level for dashboard
        //   toast.error('Additional security verification required');
        //   router.push('/auth/security-verification');
        //   return;
        // }

      } catch (error) {
        console.error('Dashboard access validation error:', error);
        if (mounted) {
          toast.error('Failed to validate dashboard access');
          router.push('/unauthorized?reason=validation_error');
        }
      }
    };

    validateDashboardAccess();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user, checkHierarchicalRole, router, pathname]);

  // Show loading state
  if (isAuthLoading || isRbacLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render dashboard layout with children
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          {/* Add your sidebar content */}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
