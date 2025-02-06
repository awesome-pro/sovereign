import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand, PutObjectTaggingCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_CLIENT } from './s3-client.provider.js';
import { createHash } from 'crypto';
import { Readable } from 'stream';
import {
  FileUploadOptions,
  FileDownloadOptions,
  FileListOptions,
  FileDeleteOptions,
  FileUploadResult,
  FileOperationResult,
  FileListResponse,
  FileInfo,
  UploadableFile,
} from './interfaces/storage.interface.js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.getOrThrow('AWS_S3_BUCKET');
  }

  /**
   * Generate a unique file key based on original filename and metadata
   */
  private generateFileKey(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const hash = createHash('md5')
      .update(`${originalName}${timestamp}`)
      .digest('hex')
      .slice(0, 8);
    
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-');
    
    return prefix 
      ? `${prefix}/${timestamp}-${hash}-${sanitizedName}`
      : `${timestamp}-${hash}-${sanitizedName}`;
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: UploadableFile,
    fileName: string,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    try {
      const key = this.generateFileKey(fileName, options.metadata?.prefix);
      
      // Basic validation
      if (!file) {
        throw new Error('File content is required');
      }
      if (!fileName) {
        throw new Error('File name is required');
      }

      // Convert input to buffer based on type
      let fileBuffer: Buffer;
      if (Buffer.isBuffer(file)) {
        fileBuffer = file;
      } else if (this.isReadableStream(file)) {
        fileBuffer = await this.streamToBuffer(file);
      } else {
        throw new Error('Invalid file input type');
      }

      // Set up the command without ACL
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: options.contentType || 'application/octet-stream',
        Metadata: {
          ...options.metadata,
          originalname: fileName,
          uploadedAt: new Date().toISOString(),
        },
        Tagging: options.tags 
          ? Object.entries(options.tags)
              .map(([key, value]) => `${key}=${value}`)
              .join('&')
          : undefined,
      });

      const result = await this.s3Client.send(command);
      
      const region = this.configService.get('AWS_REGION');
      const location = `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
      
      this.logger.log(`File uploaded successfully: ${location}`);
      
      return {
        key,
        location,
        etag: result.ETag!,
        versionId: result.VersionId,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileName}`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
        fileName,
        options,
      });

      if (error instanceof Error) {
        if (error.message.includes('AccessControlListNotSupported')) {
          throw new Error('S3 bucket does not support ACL. Please configure bucket for public access if needed.');
        }
        if (error.message.includes('NoSuchBucket')) {
          throw new Error('S3 bucket does not exist. Please check your configuration.');
        }
        if (error.message.includes('AccessDenied')) {
          throw new Error('Access denied to S3 bucket. Please check your IAM permissions.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if input is a readable stream
   */
  private isReadableStream(input: any): input is Readable | NodeJS.ReadableStream {
    return input !== null &&
      typeof input === 'object' &&
      (input instanceof Readable ||
        (typeof input.pipe === 'function' && typeof input.on === 'function'));
  }

  /**
   * Convert a readable stream to a buffer
   */
  private streamToBuffer(stream: Readable | NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      let totalSize = 0;
      
      stream.on('data', (chunk) => {
        chunks.push(chunk);
        totalSize += chunk.length;
        
        // Optional: Implement maximum size check
        const MAX_SIZE = 100 * 1024 * 1024; // 100MB
        if (totalSize > MAX_SIZE) {
          stream.emit('error', new Error('File size exceeds maximum allowed size'));
          if ('destroy' in stream) {
            (stream as Readable).destroy();
          }
        }
      });
      
      stream.on('error', (error) => {
        reject(new Error(`Stream error: ${error.message}`));
      });
      
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Generate a pre-signed URL for file download
   */
  async getSignedDownloadUrl(
    key: string,
    options: FileDownloadOptions = {},
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, {
        expiresIn: options.expiresIn || 3600,
      });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for ${key}`, error);
      throw error;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(options: FileListOptions = {}): Promise<FileListResponse> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: options.prefix,
        MaxKeys: options.maxKeys,
        ContinuationToken: options.continuationToken,
      });

      const result = await this.s3Client.send(command);

      const files: FileInfo[] = await Promise.all(
        (result.Contents || []).map(async (item) => {
          const headCommand = new HeadObjectCommand({
            Bucket: this.bucket,
            Key: item.Key!,
          });
          
          const headResult = await this.s3Client.send(headCommand);
          
          return {
            key: item.Key!,
            size: item.Size!,
            lastModified: item.LastModified!,
            etag: item.ETag!,
            contentType: headResult.ContentType,
            metadata: headResult.Metadata,
          };
        }),
      );

      return {
        files,
        nextContinuationToken: result.NextContinuationToken,
        isTruncated: result.IsTruncated || false,
      };
    } catch (error) {
      this.logger.error('Failed to list files', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(
    key: string,
    options: FileDeleteOptions = {},
  ): Promise<FileOperationResult> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
        VersionId: options.versionId,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        message: `File ${key} deleted successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}`, error);
      return {
        success: false,
        message: `Failed to delete file ${key}`,
        error,
      };
    }
  }

  /**
   * Update file tags
   */
  async updateFileTags(
    key: string,
    tags: Record<string, string>,
  ): Promise<FileOperationResult> {
    try {
      const command = new PutObjectTaggingCommand({
        Bucket: this.bucket,
        Key: key,
        Tagging: {
          TagSet: Object.entries(tags).map(([Key, Value]) => ({ Key, Value })),
        },
      });

      await this.s3Client.send(command);

      return {
        success: true,
        message: `Tags updated for file ${key}`,
      };
    } catch (error) {
      this.logger.error(`Failed to update tags for file ${key}`, error);
      return {
        success: false,
        message: `Failed to update tags for file ${key}`,
        error,
      };
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}
