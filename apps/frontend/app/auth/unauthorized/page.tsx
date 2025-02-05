import React from 'react';
import Link from 'next/link';
import { ShieldAlertIcon, LockIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-red-50 hover:border-red-100 transition-all duration-300 ease-in-out transform hover:-translate-y-2">
        <CardHeader className="text-center bg-red-50 py-8">
          <div className="mx-auto mb-4 w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlertIcon className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-600 mb-2">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-4">
            <LockIcon className="w-8 h-8 text-yellow-500" />
            <p className="text-yellow-800 text-sm">
              This area requires specific authorization. Please contact your system administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Link href="/auth/sign-in" passHref>
                <Button variant="default" className="w-full">
                  <LockIcon className="mr-2 h-4 w-4" /> Sign In
                </Button>
              </Link>
              
              <Link href="/" passHref>
                <Button variant="outline" className="w-full">
                  <HomeIcon className="mr-2 h-4 w-4" /> Home
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>Need help? Contact support at</p>
            <a 
              href="mailto:support@realestatecrm.com" 
              className="text-blue-600 hover:underline"
            >
              support@realestatecrm.com
            </a>
          </div>
        </CardContent>
      </Card>
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-100/50 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200/50 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
}
