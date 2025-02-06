import { registerEnumType } from '@nestjs/graphql';
import {
  DocumentStatus,
  DocumentSecurity,
  DocumentType,
  Language,
  DocumentFormat,
  FileCategory,
} from '@sovereign/database';

// Register all shared enums here
registerEnumType(DocumentStatus, { name: 'DocumentStatus' });
registerEnumType(DocumentSecurity, { name: 'DocumentSecurity' });
registerEnumType(DocumentType, { name: 'DocumentType' });
registerEnumType(Language, { name: 'Language' });
registerEnumType(DocumentFormat, { name: 'DocumentFormat' });
registerEnumType(FileCategory, { name: 'FileCategory' });

// Re-export the enums for convenience
export {
  DocumentStatus,
  DocumentSecurity,
  DocumentType,
  Language,
  DocumentFormat,
  FileCategory,
};
