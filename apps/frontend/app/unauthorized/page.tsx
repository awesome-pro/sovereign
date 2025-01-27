import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader className="space-y-4 pb-0">
          <div className="flex justify-center">
            <Lock className="h-16 w-16 text-destructive" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-3xl">Access Denied</CardTitle>
          <CardDescription className="text-muted-foreground">
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <p className="text-sm text-muted-foreground">
            It seems you do not have the required authorization to view this content. 
            Please contact your system administrator if you believe this is an error.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/sign-in" passHref>
              <Button variant="outline">
                Go to Sign In
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button>
                Return Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Unauthorized
