import { DocumentFormat, DocumentSecurity, DocumentStatus } from "@/constants";
import { Language } from "./profile";
import { RelatedUser } from "./user";


export interface Document {
  id: string;
  referenceNumber: string;
  type: DocumentType;
  status: DocumentStatus;
  security: DocumentSecurity;
  title: string;
  description?: string | null;
  language: Language;
  version: string;
  files: RelatedFile[];
  categories?: string[];
  customAttributes?: any;
  accesses: RelatedDocumentAccess[];
  parent?: RelatedDocument;
  parentId?: string | null;
  versions: RelatedDocument[];
  isTemplate: boolean;
  templateFields?: any;
  activities: RelatedDocumentActivity[];
  comments: RelatedDocumentComment[];
  validFrom?: Date | null;
  expiresAt?: Date | null;
  retentionPeriod?: number | null;
  transactions: RelatedTransaction[];
  createdBy: RelatedUser;
  createdById: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface RelatedFile {
  id: string;
  fileName: string;
  url: string;
  fileSize: number;
  fileType: DocumentFormat;
}

export interface RelatedDocument {
  id: string;
  title: string;
  referenceNumber: string;
}

export interface RelatedDocumentAccess {
  id: string;
  userId?: string;
  teamId?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  validFrom: Date;
  validUntil?: Date;
  grantedById: string;
  grantedAt: Date;
}

export interface RelatedDocumentActivity {
  id: string;
  activityType: string;
  description: string;
  createdAt: Date;
  user: RelatedUser;
}

export interface RelatedDocumentComment {
  id: string;
  content: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  user: RelatedUser;
  replies: RelatedDocumentComment[];
}
export interface RelatedTransaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
}

export interface DocumentFilters {
  search?: string;
  status?: DocumentStatus[];
  type?: DocumentType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
}
