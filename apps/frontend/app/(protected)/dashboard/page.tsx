'use client';

import EstateLoading from '@/components/loading';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <EstateLoading />;
  }

  return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {user?.email}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Summary</h2>
            <div className="space-y-2">
              <p>Email: {user?.email}</p>
              {/* <p>Role: {user?.roles[0]?.roleHash}</p> */}
              <p>Status: {user?.status}</p>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            {/* {user?.profile && (
              <div className="space-y-2">
                <p>Active Listings: {user.profile.activeListings}</p>
                {user.profile.rating && (
                  <p>Rating: {user.profile.rating.toFixed(1)}</p>
                )}
              </div>
            )} */}
          </div>

          {/* Quick Actions */}
          <Button onClick={() => router.push('/dashboard/notifications')}>
            View Notifications
          </Button>
        </div>
      </div>
  );
}
