import React, { useState } from 'react'
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from '@/components/ui/drawer'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, Search, X } from 'lucide-react'
import { DocumentStatus, DocumentType } from '@/constants'
import { DocumentFilters } from '@/types/document'

interface DocumentFiltersBarProps {
  filters: DocumentFilters
  onFiltersChange: (filters: DocumentFilters) => void
}

const DocumentFiltersBar: React.FC<DocumentFiltersBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState<DocumentFilters>(filters)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, search: e.target.value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleStatusChange = (status: DocumentStatus | '') => {
    const newFilters = { 
      ...localFilters, 
      status: status ? [status] : undefined 
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTypeChange = (type: DocumentType | '') => {
    const newFilters = { 
      ...localFilters, 
      type: type ? [type] : undefined 
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {}
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = 
    localFilters.search || 
    localFilters.status?.length || 
    localFilters.type?.length

  return (
    <div className="flex items-center space-x-2 mb-4">
      <div className="flex-grow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      <Select 
        value={localFilters.status?.[0] || ''} 
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(DocumentStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={localFilters.type?.[0] || ''} 
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(DocumentType).map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Advanced Filters</DrawerTitle>
            <DrawerDescription>
              Apply additional filters to narrow down your search
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 space-y-4">
            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  type="date" 
                  value={localFilters.dateRange?.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const newFilters = {
                      ...localFilters,
                      dateRange: {
                        start: new Date(e.target.value),
                        end: localFilters.dateRange?.end || new Date()
                      }
                    }
                    setLocalFilters(newFilters)
                    onFiltersChange(newFilters)
                  }}
                />
                <Input 
                  type="date" 
                  value={localFilters.dateRange?.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => {
                    const newFilters = {
                      ...localFilters,
                      dateRange: {
                        start: localFilters.dateRange?.start || new Date(),
                        end: new Date(e.target.value)
                      }
                    }
                    setLocalFilters(newFilters)
                    onFiltersChange(newFilters)
                  }}
                />
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={clearFilters}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default DocumentFiltersBar
