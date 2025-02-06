import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { StorageService } from '../../storage/storage.service.js';
import { ReferenceNumberService, ReferencePrefix, MarketCode } from '../../utils/reference-number.service.js';
import { CreateDocumentInput } from '../dto/create-document.input.js';
import { CreateDocumentAccessInput } from '../dto/create-document-access.input.js';
import { CreateDocumentCommentInput } from '../dto/create-document-comment.input.js';
import { UploadFileInput } from '../dto/upload-file.input.js';
import { CreateDocumentShareInput } from '../dto/create-document-share.input.js';
import { CreateDocumentApprovalInput } from '../dto/create-document-approval.input.js';
import { DocumentStatus, DocumentApprovalStatus, DocumentFormat } from '@sovereign/database';
import { UltraSecureJwtPayload } from '../../auth/services/auth.interfaces.js';
import { Document } from '../models/document.model.js';
import { File } from '../models/file.model.js';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private referenceNumberService: ReferenceNumberService,
  ) {}

  async createDocument(input: CreateDocumentInput, user: UltraSecureJwtPayload): Promise<Document> {
    const referenceNumber = await this.referenceNumberService.generateReferenceNumber({
      prefix: ReferencePrefix.DOCUMENT,
      market: MarketCode.DUBAI, // Default to Dubai market
      includeTimestamp: true, // Add millisecond precision
    });

    return this.prisma.document.create({
      data: {
        ...input,
        referenceNumber,
        createdById: user.sb,
        companyId: user.b,
        status: DocumentStatus.DRAFT,
      },
      include: {
        files: true,
        createdBy: true,
        company: true,
        accesses: true,
        workflow: true,
        activities: true,
        comments: true,
        approvals: true,
        versions: true,
        transactions: true,
      },
    });
  }

  async uploadFile(input: UploadFileInput, user: UltraSecureJwtPayload): Promise<File> {
    let stream;
    try {
      const { file, documentId, category, language, version, notarized, attested, expiry } = input;

      // 1. Validate document exists and user has access
      const document = await this.prisma.document.findUnique({
        where: { 
          id: documentId,
          companyId: user.b,
        },
        include: {
          accesses: true,
        },
      });

      if (!document) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      }

      // 2. Process the uploaded file
      const { createReadStream, filename, mimetype } = await file;
      
      // Create the stream
      stream = createReadStream();

      // 3. Determine file type from mimetype
      const fileType = this.getDocumentFormatFromMimeType(mimetype);

      // 4. Calculate file size first
      const stats = await this.calculateFileSize(stream);

      // Validate file size (e.g., 100MB limit)
      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Create a new stream for upload since the previous one was consumed
      stream = createReadStream();

      // 5. Upload to storage with proper metadata and tags
      const uploadResult = await this.storageService.uploadFile(
        stream,
        filename,
        {
          contentType: mimetype,
          metadata: {
            prefix: 'documents',
            documentId,
            category,
            language,
            companyId: user.b,
            uploadedBy: user.sb,
            fileSize: stats.size.toString(),
          },
          tags: {
            documentId,
            category,
            environment: process.env.NODE_ENV || 'development',
          },
        }
      );

      // 6. Create file record in database
      return this.prisma.file.create({
        data: {
          fileName: filename,
          fileSize: stats.size,
          fileType,
          mimeType: mimetype,
          url: uploadResult.location,
          checksum: uploadResult.etag,
          version: version || '1.0',
          language,
          category,
          notarized: notarized || false,
          attested: attested || false,
          expiry,
          documentId,
          uploadedById: user.sb,
        },
        include: {
          document: true,
          uploadedBy: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to upload file', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
        } : error,
        documentId: input.documentId,
        userId: user.sb,
      });

      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('AccessDenied')) {
          throw new ForbiddenException('Access denied to storage service');
        }
        if (error.message.includes('EntityTooLarge')) {
          throw new Error('File size exceeds storage service limits');
        }
      }
      throw error;
    } finally {
      // Cleanup: Ensure stream is destroyed if it exists
      if (stream && typeof stream.destroy === 'function') {
        stream.destroy();
      }
    }
  }

  /**
   * Calculate the size of a file stream
   * @param stream The readable stream
   * @returns Promise with the file size
   */
  private calculateFileSize(stream: NodeJS.ReadableStream): Promise<{ size: number }> {
    return new Promise((resolve, reject) => {
      let size = 0;
      
      stream.on('data', (chunk: Buffer) => {
        size += chunk.length;
      });
      
      stream.on('end', () => {
        resolve({ size });
      });
      
      stream.on('error', (error) => {
        reject(new Error(`Failed to calculate file size: ${error.message}`));
      });
    });
  }

  /**
   * Helper method to determine DocumentFormat from MIME type
   */
  private getDocumentFormatFromMimeType(mimeType: string): DocumentFormat {
    const mimeTypeMap: Record<string, DocumentFormat> = {
      'application/pdf': DocumentFormat.PDF,
      'image/jpeg': DocumentFormat.JPG,
      'image/png': DocumentFormat.PNG,
      'application/msword': DocumentFormat.WORD,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentFormat.WORD,
      'application/vnd.ms-excel': DocumentFormat.EXCEL,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': DocumentFormat.EXCEL,
    };

    return mimeTypeMap[mimeType] || DocumentFormat.PDF
  }

  async getDocument(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        files: true,
        createdBy: true,
        company: true,
        accesses: {
          include: {
            team: true,
          },
        },
        workflow: true,
        activities: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            user: true,
            replies: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Log view activity
    await this.prisma.documentActivity.create({
      data: {
        documentId: id,
        userId,
        activityType: 'VIEW',
        description: 'Viewed document',
      },
    });

    return document;
  }

  async getDocuments(companyId: string) {
    return this.prisma.document.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        files: true,
        createdBy: true,
        company: true,
        accesses: true,
        workflow: true,
        _count: {
          select: {
            activities: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateDocumentStatus(id: string, status: DocumentStatus, userId: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { status },
    });

    await this.prisma.documentActivity.create({
      data: {
        documentId: id,
        userId,
        activityType: 'STATUS_CHANGE',
        description: `Changed status to ${status}`,
      },
    });

    return document;
  }

  async deleteDocument(id: string, userId: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: DocumentStatus.DELETED,
      },
    });

    await this.prisma.documentActivity.create({
      data: {
        documentId: id,
        userId,
        activityType: 'DELETE',
        description: 'Deleted document',
      },
    });

    return document;
  }

  async createDocumentAccess(input: CreateDocumentAccessInput, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: input.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${input.documentId} not found`);
    }

    return this.prisma.documentAccess.create({
      data: {
        ...input,
        grantedById: userId,
        grantedAt: new Date(), // Always set current timestamp
      },
      include: {
        document: true,
        team: true,
      },
    });
  }

  // async createDocumentWorkflow(input: CreateDocumentWorkflowInput, userId: string) {
  //   const document = await this.prisma.document.findUnique({
  //     where: { id: input.documentId },
  //   });

  //   if (!document) {
  //     throw new NotFoundException(`Document with ID ${input.documentId} not found`);
  //   }

  //   return this.prisma.documentWorkflow.create({
  //     data: {
  //       ...input,
  //       completedBy: input.completedBy || userId,
  //     },
  //     include: {
  //       document: true,
  //     },
  //   });
  // }

  async createDocumentComment(input: CreateDocumentCommentInput, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: input.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${input.documentId} not found`);
    }

    return this.prisma.documentComment.create({
      data: {
        ...input,
        userId,
      },
      include: {
        document: true,
        user: true,
        parent: true,
        replies: true,
      },
    });
  }

  async resolveDocumentComment(commentId: string, userId: string) {
    const comment = await this.prisma.documentComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    return this.prisma.documentComment.update({
      where: { id: commentId },
      data: {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
      },
      include: {
        document: true,
        user: true,
        parent: true,
        replies: true,
      },
    });
  }

  async createDocumentShare(input: CreateDocumentShareInput, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: input.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${input.documentId} not found`);
    }

    // Create share link
    const share = await this.prisma.documentShare.create({
      data: {
        ...input,
        createdBy: userId,
        viewCount: 0,
      },
      include: {
        document: true,
      },
    });

    // Log activity
    await this.prisma.documentActivity.create({
      data: {
        documentId: input.documentId,
        userId,
        activityType: 'SHARE',
        description: `Created ${input.shareType} share`,
      },
    });

    return share;
  }

  async createDocumentApproval(input: CreateDocumentApprovalInput, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: input.documentId },
      include: {
        workflow: true,
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${input.documentId} not found`);
    }

    if (!document.workflow) {
      throw new ForbiddenException('Document workflow must be created before adding approvals');
    }

    const approval = await this.prisma.documentApproval.create({
      data: {
        ...input,
      },
      include: {
        document: true,
        approver: true,
      },
    });

    // Log activity
    await this.prisma.documentActivity.create({
      data: {
        documentId: input.documentId,
        userId,
        activityType: 'APPROVAL_ADDED',
        description: `Added approval request for ${input.approverId}`,
      },
    });

    return approval;
  }

  async updateDocumentApproval(id: string, status: DocumentApprovalStatus, comments: string | undefined, userId: string) {
    const approval = await this.prisma.documentApproval.findUnique({
      where: { id },
      include: {
        document: true,
      },
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    if (approval.approverId !== userId) {
      throw new ForbiddenException('Only the assigned approver can update the approval status');
    }

    const updatedApproval = await this.prisma.documentApproval.update({
      where: { id },
      data: {
        status,
        comments,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: {
        document: true,
        approver: true,
      },
    });

    // Log activity
    await this.prisma.documentActivity.create({
      data: {
        documentId: approval.documentId,
        userId,
        activityType: 'APPROVAL_UPDATED',
        description: `Updated approval status to ${status}`,
      },
    });

    // Update workflow if all approvals are complete
    await this.checkWorkflowCompletion(approval.documentId);

    return updatedApproval;
  }

  private async checkWorkflowCompletion(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        workflow: true,
        approvals: true,
      },
    });

    if (!document || !document.workflow) return;

    const allApproved = document.approvals.every(a => a.status === 'APPROVED');
    const requiredApproversmet = document.approvals.filter(a => a.status === 'APPROVED').length >= document.workflow.requiredApprovers;

    if (allApproved && requiredApproversmet) {
      await this.prisma.documentWorkflow.update({
        where: { documentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await this.updateDocumentStatus(documentId, DocumentStatus.PUBLISHED, document.createdById);
    }
  }

  async getDocumentViews(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return this.prisma.documentView.findMany({
      where: { documentId },
      include: {
        document: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDocumentShares(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return this.prisma.documentShare.findMany({
      where: { documentId },
      include: {
        document: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDocumentApprovals(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return this.prisma.documentApproval.findMany({
      where: { documentId },
      include: {
        document: true,
        approver: true,
      },
      orderBy: {
        sequence: 'asc',
      },
    });
  }
}
