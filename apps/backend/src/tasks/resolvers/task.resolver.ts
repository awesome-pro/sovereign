import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from '../services/task.service.js';
import { Task } from '../dto/task.dto.js';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput, TaskChecklistInput, TaskCommentInput } from '../dto/task-input.dto.js';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../auth/types/auth.types.js';


@Resolver(() => Task)
@UseGuards(GqlAuthGuard)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => Task)
  async task(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Task> {
    return this.taskService.getTask(id);
  }

  @Query(() => [Task])
  async tasks(
    @Args('filter', { nullable: true }) filter: TaskFilterInput,
    @Context() { req, res }: { req: any; res: any },
  ): Promise<Task[]> {
    return this.taskService.getTasks(filter, req.user.sb);
  }

  @Mutation(() => Task)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @Context() {req, res}: {req: any; res: any},
  ): Promise<Task> {
    return this.taskService.createTask(input, req.user.sb);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('input') input: UpdateTaskInput,
    @Context() {req, res}: {req: any; res: any},
  ): Promise<Task> {
    return this.taskService.updateTask(input, req.user.sb);
  }

  @Mutation(() => Boolean)
  async deleteTask(
    @Args('id', { type: () => ID }) id: string,
    @Context() {req, res}: {req: any; res: any},
  ): Promise<boolean> {
    return this.taskService.deleteTask(id, req.user.sb);
  }

  @Mutation(() => Task)
  async addTaskChecklistItem(
    @Args('taskId', { type: () => ID }) taskId: string,
    @Args('input') input: TaskChecklistInput,
    @Context() {req, res}: {req: any; res: any},
  ): Promise<Task> {
    return this.taskService.addChecklistItem(taskId, input, req.user.sb);
  }

  @Mutation(() => Task)
  async addTaskComment(
    @Args('input') input: TaskCommentInput,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.taskService.addComment(input, user.id);
  }
}
