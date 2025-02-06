import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Document } from '../models/document.model.js';
import { File } from '../models/file.model.js';
import { DocumentAccess } from '../models/document-access.model.js';
// import { DocumentWorkflow } from '../models/document-workflow.model.js';
import { DocumentComment } from '../models/document-comment.model.js';
import { DocumentShare } from '../models/document-share.model.js';
import { DocumentApproval } from '../models/document-approval.model.js';
// import { DocumentView } from '../models/document-view.model.js';
import { DocumentService } from '../services/document.service.js';
import { CreateDocumentInput } from '../dto/create-document.input.js';
import { CreateDocumentAccessInput } from '../dto/create-document-access.input.js';
// import { CreateDocumentWorkflowInput } from '../dto/create-document-workflow.input.js';
import { CreateDocumentCommentInput } from '../dto/create-document-comment.input.js';
import { UploadFileInput } from '../dto/upload-file.input.js';
import { CreateDocumentShareInput } from '../dto/create-document-share.input.js';
import { CreateDocumentApprovalInput } from '../dto/create-document-approval.input.js';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard.js';
import { DocumentApprovalStatus, DocumentStatus } from '@sovereign/database';

@Resolver(() => Document)
@UseGuards(GqlAuthGuard)
export class DocumentResolver {
  constructor(private documentService: DocumentService) {}

  @Query(() => Document)
  async document(
    @Args('id') id: string,
    @Context() {req, res}: {req: any; res: any} 
  ) {
    return this.documentService.getDocument(id, req.user.sb);
  }

  @Query(() => [Document])
  async documents(
    @Context() {req, res}: {req: any; res: any},
  ) {
    return this.documentService.getDocuments(req.user.sb);
  }

  @Mutation(() => Document)
  async createDocument(
    @Args('input') input: CreateDocumentInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.createDocument(input, req.user);
  }

  @Mutation(() => File)
  async uploadFile(
    @Args('input') input: UploadFileInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.uploadFile(input, req.user);
  }

  @Mutation(() => Document)
  async updateDocumentStatus(
    @Args('id') id: string,
    @Args('status') status: DocumentStatus,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.updateDocumentStatus(id, status, req.user);
  }

  @Mutation(() => Document)
  async deleteDocument(
    @Args('id') id: string,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.deleteDocument(id, req.user.sb);
  }

  @Mutation(() => DocumentAccess)
  async createDocumentAccess(
    @Args('input') input: CreateDocumentAccessInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.createDocumentAccess(input, req.user.sb);
  }

  // @Mutation(() => DocumentWorkflow)
  // async createDocumentWorkflow(
  //   @Args('input') input: CreateDocumentWorkflowInput,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.documentService.createDocumentWorkflow(input, user.id);
  // }

  @Mutation(() => DocumentComment)
  async createDocumentComment(
    @Args('input') input: CreateDocumentCommentInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.createDocumentComment(input, req.user.sb);
  }

  @Mutation(() => DocumentComment)
  async resolveDocumentComment(
    @Args('id') id: string,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.resolveDocumentComment(id, req.user.sb);
  }

  @Mutation(() => DocumentShare)
  async createDocumentShare(
    @Args('input') input: CreateDocumentShareInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.createDocumentShare(input, req.user.sb);
  }

  @Mutation(() => DocumentApproval)
  async createDocumentApproval(
    @Args('input') input: CreateDocumentApprovalInput,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.createDocumentApproval(input, req.user.sb);
  }

  @Mutation(() => DocumentApproval)
  async updateDocumentApproval(
    @Args('id') id: string,
    @Args('status') status: DocumentApprovalStatus,
    @Context() { req, res }: { req: any; res: any},
    @Args('comments', { nullable: true }) comments?: string,
  ) {
    return this.documentService.updateDocumentApproval(id, status, comments, req.user.sb);
  }

  // @Query(() => [DocumentView])
  // async documentViews(
  //   @Args('documentId') documentId: string,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.documentService.getDocumentViews(documentId, user.id);
  // }

  @Query(() => [DocumentShare])
  async documentShares(
    @Args('documentId') documentId: string,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.getDocumentShares(documentId, req.user.sb);
  }

  @Query(() => [DocumentApproval])
  async documentApprovals(
    @Args('documentId') documentId: string,
    @Context() { req, res }: { req: any; res: any},
  ) {
    return this.documentService.getDocumentApprovals(documentId, req.user.sb);
  }
}
