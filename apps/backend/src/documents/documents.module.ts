import { Module } from '@nestjs/common';
import { DocumentService } from './services/document.service.js';
import { DocumentResolver } from './resolvers/document.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [DocumentService, DocumentResolver],
  exports: [DocumentService],
})
export class DocumentsModule {}
