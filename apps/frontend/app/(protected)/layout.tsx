import { AppSidebar } from '@/components/app-sidebar'
import { ModeToggle } from '@/components/theme-toggle'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AuthProvider } from '@/providers/auth-provider'
import { RBACProvider } from '@/providers/rbac-provider'
import React from 'react'

function ProtectedRoute(
    {
      children
    }: {
        children: React.ReactNode
    }
) {
  return (
    // <RBACProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className='w-full'>
          <div className='flex items-center justify-between w-full p-4 sticky top-0 z-50 bg-white/70 dark:bg-transparent'>
            <SidebarTrigger />
            <ModeToggle />
          </div>
          {children}
        </main>
      </SidebarProvider>
    // </RBACProvider>
  )
}

export default ProtectedRoute
