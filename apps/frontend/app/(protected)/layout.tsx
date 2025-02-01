import { AppSidebar } from '@/components/app-sidebar'
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
    <RBACProvider>
      <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
      </SidebarProvider>
    </RBACProvider>
  )
}

export default ProtectedRoute
