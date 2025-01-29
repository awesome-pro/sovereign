import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput, TaskChecklistInput, TaskCommentInput } from '../dto/task-input.dto.js';
import { Task } from '../dto/task.dto.js';
import { TaskStatus } from "@sovereign/database";
import { transformPrismaNulls } from 'src/types/utils.js';


@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    const {
      assignedToIds = [],
      leadIds = [],
      dealIds = [],
      propertyIds = [],
      ...taskData
    } = input;

    return await this.prisma.task.create({
      data: {
        ...taskData,
        createdBy: { connect: { id: userId } },
        assignedTo: {
          connect: assignedToIds.map(id => ({ id })),
        },
        leads: {
          connect: leadIds.map(id => ({ id })),
        },
        deals: {
          connect: dealIds.map(id => ({ id })),
        },
        propertyTasks: {
          create: propertyIds.map(propertyId => ({
            property: { connect: { id: propertyId } },
          })),
        },
      },
      include: {
        createdBy: true,
        assignedTo: true,
        checklist: true,
        comments: {
          include: {
            author: true,
          },
        },
        leads: true,
        deals: true,
        propertyTasks: {
          include: {
            property: true,
          },
        },
      },
    });
  }

  async updateTask(input: UpdateTaskInput, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: input.id },
      include: { createdBy: true, assignedTo: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to update
    const canUpdate = task.createdById === userId || 
                     task.assignedTo.some(user => user.id === userId);
    
    if (!canUpdate) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    const {
      id,
      assignedToIds,
      ...updateData
    } = input;

    // If status is being updated to COMPLETED, set completedAt
    if (updateData.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        assignedTo: assignedToIds ? {
          set: assignedToIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        createdBy: true,
        assignedTo: true,
        checklist: true,
        comments: {
          include: {
            author: true,
          },
        },
        leads: true,
        deals: true,
        propertyTasks: {
          include: {
            property: true,
          },
        },
      },
    });
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.prisma.task.delete({ where: { id } });
    return true;
  }

  async getTask(id: string): Promise<any> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        checklist: true,
        comments: {
          include: {
            author: true,
          },
        },
        leads: true,
        deals: true,
        propertyTasks: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async getTasks(filter: TaskFilterInput, userId: string): Promise<Task[]> {
    const where = {
      OR: [
        { createdById: userId },
        { assignedTo: { some: { id: userId } } },
      ],
      ...(filter.status && { status: { in: filter.status } }),
      ...(filter.priority && { priority: { in: filter.priority } }),
      ...(filter.type && { type: { in: filter.type } }),
      ...(filter.dueDateFrom && { dueDate: { gte: filter.dueDateFrom } }),
      ...(filter.dueDateTo && { dueDate: { lte: filter.dueDateTo } }),
      ...(filter.assignedToIds && { assignedTo: { some: { id: { in: filter.assignedToIds } } } }),
      ...(filter.createdByIds && { createdById: { in: filter.createdByIds } }),
    };

    return this.prisma.task.findMany({
      where,
      include: {
        createdBy: true,
        assignedTo: true,
        checklist: true,
        comments: {
          include: {
            author: true,
          },
        },
        leads: true,
        deals: true,
        propertyTasks: {
          include: {
            property: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async addChecklistItem(taskId: string, input: TaskChecklistInput, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const canEdit = task.createdById === userId || 
                   task.assignedTo.some(user => user.id === userId);

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this task');
    }

    await this.prisma.taskChecklist.create({
      data: {
        ...input,
        task: { connect: { id: taskId } },
      },
    });

    return this.getTask(taskId);
  }

  async addComment(input: TaskCommentInput, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId },
      include: { assignedTo: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const canComment = task.createdById === userId || 
                      task.assignedTo.some(user => user.id === userId);

    if (!canComment) {
      throw new ForbiddenException('You do not have permission to comment on this task');
    }

    await this.prisma.taskComment.create({
      data: {
        content: input.content,
        task: { connect: { id: input.taskId } },
        author: { connect: { id: userId } },
      },
    });

    return this.getTask(input.taskId);
  }
}
