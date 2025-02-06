import React from 'react'
import { cn } from "@/lib/utils"

interface DocumentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DocumentLayout({ 
  children, 
  className, 
  ...props 
}: DocumentLayoutProps) {
  return (
    <div 
      className={cn(
        "flex flex-col space-y-4 p-4 w-full max-w-7xl mx-auto", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DocumentHeader({
  title,
  description,
  actions
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}
