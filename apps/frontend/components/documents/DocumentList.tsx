import React, { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Download, 
  MoreHorizontal, 
  Share2, 
  Trash2 
} from 'lucide-react'
import { format } from 'date-fns'
import { Document, DocumentFilters } from '@/types/document'
import { DocumentStatus } from '@/constants'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import { DocumentLayout } from './DocumentLayout'
import DocumentFiltersBar from './DocumentFiltersBar'

const statusColors = {
  DRAFT: 'gray',
  PENDING: 'yellow',
  PUBLISHED: 'green',
  ARCHIVED: 'purple',
  DELETED: 'red',
};

export function DocumentList() {
  const [filters, setFilters] = useState<DocumentFilters>({})
  const { 
    documents, 
    loading, 
    filterDocuments, 
    updateDocumentStatus 
  } = useDocuments()

  const filteredDocuments = filterDocuments(documents, filters)

  const handleStatusChange = async (documentId: string, status: DocumentStatus) => {
    try {
      await updateDocumentStatus(documentId, status)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DocumentLayout>
      <DocumentFiltersBar filters={filters} onFiltersChange={setFilters} />
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Files</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="font-medium">{doc.title}</div>
                <div className="text-sm text-muted-foreground">
                  {doc.description}
                </div>
              </TableCell>
              <TableCell>{doc.referenceNumber}</TableCell>
              <TableCell>
                <DocumentStatusBadge status={doc.status} />
              </TableCell>
              <TableCell>
                {format(new Date(doc.createdAt), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {doc.files.map((file) => (
                    <Button
                      key={file.id}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.url, file.fileName)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onSelect={() => {/* Handle share */}}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
                    {doc.status !== DocumentStatus.DELETED && (
                      <DropdownMenuItem 
                        onSelect={() => handleStatusChange(doc.id, DocumentStatus.DELETED)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DocumentLayout>
  )
}
