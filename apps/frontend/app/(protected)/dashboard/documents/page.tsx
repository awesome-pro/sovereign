"use client";

import React from 'react'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

import { DocumentList } from '@/components/documents/DocumentList'
import { useDocuments } from '@/hooks/useDocuments'
import { 
  DocumentType, 
  DocumentSecurity, 
  Language 
} from '@/constants'

const documentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.nativeEnum(DocumentType),
  security: z.nativeEnum(DocumentSecurity),
  description: z.string().optional(),
  language: z.nativeEnum(Language)
})

type DocumentFormData = z.infer<typeof documentSchema>

const DocumentsPage: React.FC = () => {
  const { createDocument } = useDocuments()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      type: DocumentType.OTHER,
      security: DocumentSecurity.INTERNAL,
      description: '',
      language: Language.ENGLISH
    }
  })

  const onSubmit = async (data: DocumentFormData) => {
    try {
      await createDocument(data)
      
      toast({
        title: 'Document Created',
        description: 'Your new document has been successfully created.',
      })

      form.reset()
      setDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error 
          ? error.message 
          : 'An unknown error occurred',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>
                Fill out the details for your new document.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter document title" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DocumentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="security"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document security" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DocumentSecurity).map((security) => (
                            <SelectItem key={security} value={security}>
                              {security}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Language).map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter document description" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Create Document
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <DocumentList />
    </div>
  )
}

export default DocumentsPage
