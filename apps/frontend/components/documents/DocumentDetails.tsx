import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Download, 
  Edit2, 
  Share2, 
  Lock, 
  Unlock, 
  MoreHorizontal 
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DocumentUpload } from './DocumentUpload'
import { Document } from '@/types/document'
import { DocumentStatus } from '@/constants'
import { toast } from '@/hooks/use-toast'

interface DocumentDetailsProps {
  document: Document
  onStatusChange: (status: DocumentStatus) => void
}

export function DocumentDetails({ 
  document, 
  onStatusChange 
}: DocumentDetailsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleDownload = (url: string, fileName: string) => {
    // const link = document.createElement('a')
    // link.href = url
    // link.download = fileName
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
  }

  const handleSecurityToggle = () => {
    try {
      // Implement security toggle logic
      toast({
        title: 'Security Updated',
        description: `Document security changed to ${
          document.security === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
        }`,
      })
    } catch (error) {
      toast({
        title: 'Security Update Failed',
        description: error instanceof Error 
          ? error.message 
          : 'An unknown error occurred',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {document.title}
            </h1>
            <Badge variant={document.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {document.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{document.referenceNumber}</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleSecurityToggle}
          >
            {document.security === 'PUBLIC' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
                <CardDescription>Basic details about the document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-muted-foreground">
                    {document.description || 'No description'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Categories</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {document.categories?.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Created By</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={document.createdBy.avatar} alt={document.createdBy.name} />
                      <AvatarFallback>
                        {document.createdBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{document.createdBy.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
                <CardDescription>Important dates related to the document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {format(new Date(document.createdAt), 'PPP')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Last Modified</p>
                  <p className="text-muted-foreground">
                    {format(new Date(document.updatedAt), 'PPP')}
                  </p>
                </div>

                {document.validFrom && (
                  <div>
                    <p className="text-sm font-medium">Valid From</p>
                    <p className="text-muted-foreground">
                      {format(new Date(document.validFrom), 'PPP')}
                    </p>
                  </div>
                )}

                {document.expiresAt && (
                  <div>
                    <p className="text-sm font-medium">Expires At</p>
                    <p className="text-muted-foreground">
                      {format(new Date(document.expiresAt), 'PPP')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Document Files</CardTitle>
              <CardDescription>Manage and download document files</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => setIsUploadOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Upload New File
              </Button>

              <Separator className="mb-4" />

              {document.files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex justify-between items-center p-4 bg-secondary/20 rounded-md mb-2"
                >
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownload(file.url, file.fileName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Document Activity</CardTitle>
              <CardDescription>Recent actions and changes</CardDescription>
            </CardHeader>
            <CardContent>
              {document.activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-4 p-4 bg-secondary/20 rounded-md mb-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback>
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.createdAt), 'PPp')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Discussions and notes about the document</CardDescription>
            </CardHeader>
            <CardContent>
              {document.comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className="space-y-2 p-4 bg-secondary/20 rounded-md mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                        <AvatarFallback>
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.user.name}</p>
                        {/* <p className="text-sm text-muted-foreground">
                          {format(new Date(comment.createdAt), 'PPp')}
                        </p> */}
                      </div>
                    </div>
                    {comment.resolved && (
                      <Badge variant="outline">Resolved</Badge>
                    )}
                  </div>
                  <p className="pl-10">{comment.content}</p>

                  {comment.replies.length > 0 && (
                    <div className="pl-10 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <div 
                          key={reply.id} 
                          className="flex items-start space-x-2"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                            <AvatarFallback>
                              {reply.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage document access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {document.accesses.map((access) => (
                <div 
                  key={access.id} 
                  className="flex justify-between items-center p-4 bg-secondary/20 rounded-md mb-2"
                >
                  <div>
                    <p className="font-medium">
                      {access.userId ? 'User Access' : 'Team Access'}
                    </p>
                    <div className="flex space-x-2 mt-1">
                      {access.canView && <Badge variant="secondary">View</Badge>}
                      {access.canEdit && <Badge variant="secondary">Edit</Badge>}
                      {access.canDelete && <Badge variant="secondary">Delete</Badge>}
                      {access.canShare && <Badge variant="secondary">Share</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Granted: {format(new Date(access.grantedAt), 'PP')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modal */}
      <DocumentUpload 
        documentId={document.id} 
        isOpen={isUploadOpen} 
        onOpenChange={setIsUploadOpen} 
      />
    </div>
  )
}
