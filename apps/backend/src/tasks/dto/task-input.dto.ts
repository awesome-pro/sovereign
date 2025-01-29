import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { TaskStatus, TaskType, Priority } from '@sovereign/database';
import { IsString, IsOptional, IsEnum, IsArray, IsDate, IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TaskType)
  @IsEnum(TaskType)
  type!: TaskType;

  @Field(() => Priority)
  @IsEnum(Priority)
  priority!: Priority;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  assignedToIds?: string[];
}

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsUUID("4")
  id!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => TaskType, { nullable: true })
  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @Field(() => TaskStatus, { nullable: true })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @Field(() => Priority, { nullable: true })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  assignedToIds?: string[];

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  completedAt?: Date;
}

@InputType()
export class TaskFilterInput {
  @Field(() => [TaskStatus], { nullable: true })
  @IsEnum(TaskStatus, { each: true })
  @IsOptional()
  status?: TaskStatus[];

  @Field(() => [Priority], { nullable: true })
  @IsEnum(Priority, { each: true })
  @IsOptional()
  priority?: Priority[];

  @Field(() => [TaskType], { nullable: true })
  @IsEnum(TaskType, { each: true })
  @IsOptional()
  type?: TaskType[];

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDateFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDateTo?: Date;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  assignedToIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  createdByIds?: string[];
}

@InputType()
export class TaskChecklistInput {
  @Field(() => String)
  @IsString()
  item!: string;
}

@InputType()
export class TaskCommentInput {
  @Field(() => ID)
  @IsUUID("4")
  taskId!: string;

  @Field(() => String)
  @IsString()
  content!: string;
}

registerEnumType(TaskType, {
  name: 'TaskType',
  description: 'Type of task',
});

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Status of task',
});

registerEnumType(Priority, {
  name: 'Priority',
  description: 'Priority of task',
});
