import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service.js';
import { ProfileResolver } from './resolvers/profile.resolver.js';
import { StorageModule } from '../storage/storage.module.js';
import { LoggingModule } from '../logging/logging.module.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [
    StorageModule,
    LoggingModule,
  ],
  providers: [
    ProfileService,
    ProfileResolver,
    PrismaService,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
