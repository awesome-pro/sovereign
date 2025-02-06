import { Module } from '@nestjs/common';
import { DocumentService } from './services/document.service.js';
import { DocumentResolver } from './resolvers/document.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { ReferenceNumberService } from '../utils/reference-number.service.js';


@Module({
  imports: [PrismaModule, StorageModule],
  providers: [DocumentService, DocumentResolver, ReferenceNumberService],
  exports: [DocumentService],
})
export class DocumentsModule {}
