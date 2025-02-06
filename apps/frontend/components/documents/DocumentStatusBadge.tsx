import React from 'react'
import { Badge } from '@/components/ui/badge'
import { DocumentStatus } from '@/constants'
import { cn } from '@/lib/utils'

const statusVariants = {
  [DocumentStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [DocumentStatus.PUBLISHED]: 'bg-green-100 text-green-800',
  [DocumentStatus.ARCHIVED]: 'bg-yellow-100 text-yellow-800',
  [DocumentStatus.DELETED]: 'bg-red-100 text-red-800'
}

interface DocumentStatusBadgeProps {
  status: DocumentStatus
  className?: string
}

export function DocumentStatusBadge({ 
  status, 
  className 
}: DocumentStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        statusVariants[status], 
        'capitalize', 
        className
      )}
    >
      {status.toLowerCase()}
    </Badge>
  )
}
