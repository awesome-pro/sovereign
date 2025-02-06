import { Readable } from 'stream';

export type UploadableFile = Buffer | Readable | NodeJS.ReadableStream;

export interface FileUploadOptions {
  acl?: 'private' | 'public-read' | 'public-read-write';
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  expiresIn?: number; // URL expiration in seconds
}

export interface FileDownloadOptions {
  expiresIn?: number; // URL expiration in seconds
}

export interface FileListOptions {
  prefix?: string;
  maxKeys?: number;
  continuationToken?: string;
}

export interface FileListResponse {
  files: FileInfo[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface FileDeleteOptions {
  versionId?: string;
}

export interface FileUploadResult {
  key: string;
  location: string;
  etag: string;
  versionId?: string;
}

export interface FileOperationResult {
  success: boolean;
  message?: string;
  error?: any;
}
