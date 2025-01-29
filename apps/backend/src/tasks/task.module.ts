import { Module } from '@nestjs/common';
import { TaskService } from './services/task.service.js';
import { TaskResolver } from './resolvers/task.resolver.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [TaskService, TaskResolver],
  exports: [TaskService],
})
export class TaskModule {}
