import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageService } from './storage.service.js';
import { S3ClientProvider } from './s3-client.provider.js';

@Module({
  imports: [ConfigModule],
  providers: [StorageService, S3ClientProvider],
  exports: [StorageService],
})
export class StorageModule {}
