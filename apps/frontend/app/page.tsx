"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/providers/auth-provider'
import EstateLoading from '@/components/loading';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function MainPage() {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in' + isLoading + isAuthenticated);
      //router.push('/auth/sign-in');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <EstateLoading />;
  }

  if (!isAuthenticated || !user) {
    return <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Sovereign!</h1>
      <p>Please sign in to continue.</p>
    </div>
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Sovereign!</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        {/* <p><span className="font-semibold">Role:</span> {user.roles[0]?.role.name}</p> */}

        <Link href="/dashboard">
          <Button>
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </main>
  )
}

export default MainPage
