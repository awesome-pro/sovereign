import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { 
  Cloud, 
  FileText, 
  Loader2, 
  UploadCloud 
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { 
  FileCategory, 
  Language 
} from '@/constants'
import { useDocuments } from '@/hooks/useDocuments'

const fileUploadSchema = z.object({
  file: z.instanceof(File).optional(),
  category: z.nativeEnum(FileCategory),
  language: z.nativeEnum(Language),
  version: z.string().min(1, 'Version is required')
})

type FileUploadFormData = z.infer<typeof fileUploadSchema>

interface DocumentUploadProps {
  documentId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DocumentUpload({ 
  documentId, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: DocumentUploadProps) {
  const { uploadFile } = useDocuments()
  const [uploading, setUploading] = useState(false)

  const form = useForm<FileUploadFormData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      category: FileCategory.OTHER,
      language: Language.ENGLISH,
      version: '1.0'
    }
  })

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
    },
    onDropAccepted: (files) => {
      form.setValue('file', files[0])
    }
  })

  const onSubmit = async (data: FileUploadFormData) => {
    if (!data.file) {
      toast({
        title: 'No file selected',
        description: 'Please upload a file',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      await uploadFile({
        file: data.file,
        documentId,
        category: data.category,
        language: data.language,
        version: data.version
      })

      toast({
        title: 'File Uploaded',
        description: 'Your file has been successfully uploaded',
      })

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document File</DialogTitle>
          <DialogDescription>
            Upload a new file to this document. Supported formats: PDF, Word, Excel, Images
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed hover:border-primary transition-colors",
                isDragActive ? "border-primary bg-primary/10" : "border-muted"
              )}
            >
              <input {...getInputProps()} />
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                {acceptedFiles.length ? (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <span>{acceptedFiles[0]?.name}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive 
                        ? 'Drop the file here' 
                        : 'Drag and drop a file here, or click to select'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select file category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(FileCategory).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Document version" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
