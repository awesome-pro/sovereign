import { Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TaskType, TaskStatus, Priority } from '@sovereign/database';

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @Field(() => TaskType)
  @IsEnum(TaskType)
  type!: TaskType;

  @Field(() => Priority)
  @IsEnum(Priority)
  priority?: Priority;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  assignedToIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  leadIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  dealIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  propertyIds?: string[];
}

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
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
  dueDate?: Date;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  assignedToIds?: string[];

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  completedAt?: Date;
}

@InputType()
export class TaskChecklistInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  item!: string;
}

@InputType()
export class TaskCommentInput {
  @Field(() => ID)
  @IsNotEmpty()
  taskId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

@InputType()
export class TaskFilterInput {
  @Field(() => [TaskStatus], { nullable: true })
  @IsOptional()
  status?: TaskStatus[];

  @Field(() => [Priority], { nullable: true })
  @IsOptional()
  priority?: Priority[];

  @Field(() => [TaskType], { nullable: true })
  @IsOptional()
  type?: TaskType[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dueDateFrom?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dueDateTo?: Date;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  assignedToIds?: string[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  createdByIds?: string[];
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
