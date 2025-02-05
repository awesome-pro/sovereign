import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver.js';
import { SearchService } from './search.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [SearchResolver, SearchService],
  exports: [SearchService],
})
export class SearchModule {}
