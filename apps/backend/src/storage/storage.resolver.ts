import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { StorageService } from './storage.service.js';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard.js';
import { Permissions } from '../auth/decorators/rbac.decorator.js';
import { FileUploadResult, FileOperationResult, FileListResponse } from './types/storage.types.js';
import { UploadScalar } from '../common/scalars/upload.scalar.js';

@Resolver()
@UseGuards(GqlAuthGuard)
export class StorageResolver {
  constructor(private readonly storageService: StorageService) {}

  @Mutation(() => FileUploadResult)
  async uploadFile(
    @Args({ name: 'file', type: () => UploadScalar })
    fileUpload: Promise<FileUpload>,
    @Args('prefix', { nullable: true }) prefix?: string,
    @Args('isPublic', { nullable: true }) isPublic?: boolean,
  ): Promise<FileUploadResult> {
    const { createReadStream, filename, mimetype } = await fileUpload;
    const stream = createReadStream();
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    return this.storageService.uploadFile(buffer, filename, {
      contentType: mimetype,
      acl: isPublic ? 'public-read' : 'private',
      metadata: { prefix: prefix || '' },
    });
  }

  @Query(() => String)
//   @Permissions([{ resourceCode: '0f', actions: ['VIEW'] }])
  async getFileUrl(
    @Args('key') key: string,
    @Args('expiresIn', { nullable: true }) expiresIn?: number,
  ): Promise<string> {
    return this.storageService.getSignedDownloadUrl(key, { expiresIn });
  }

  @Query(() => FileListResponse)
//   @Permissions([{ resourceCode: '0f', actions: ['VIEW'] }])
  async listFiles(
    @Args('prefix', { nullable: true }) prefix?: string,
    @Args('maxKeys', { nullable: true }) maxKeys?: number,
    @Args('continuationToken', { nullable: true }) continuationToken?: string,
  ): Promise<FileListResponse> {
    return this.storageService.listFiles({
      prefix,
      maxKeys,
      continuationToken,
    });
  }

  @Mutation(() => FileOperationResult)
//   @Permissions([{ resourceCode: '0f', actions: ['DELETE'] }])
  async deleteFile(
    @Args('key') key: string,
  ): Promise<FileOperationResult> {
    return this.storageService.deleteFile(key);
  }

  @Mutation(() => FileOperationResult)
//   @Permissions([{ resourceCode: '0f', actions: ['EDIT'] }])
  async updateFileTags(
    @Args('key') key: string,
    @Args('tags', { type: () => Object }) tags: Record<string, string>,
  ): Promise<FileOperationResult> {
    return this.storageService.updateFileTags(key, tags);
  }
}
