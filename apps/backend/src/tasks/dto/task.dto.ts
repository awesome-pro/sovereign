import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedUser } from '../../auth/types/auth.types.js';
import { TaskStatus, TaskType, Priority } from '@sovereign/database';

@ObjectType()
export class TaskChecklist {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  item!: string;

  @Field(() => Date, { nullable: true })
  completedAt?: Date | null;

  @Field(() => Boolean)
  completed!: boolean;
}

@ObjectType()
export class TaskComment {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  content!: string;

  @Field(() => RelatedUser)
  author!: RelatedUser;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => TaskType)
  type!: TaskType;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => Priority)
  priority!: Priority;

  @Field(() => Date, { nullable: true })
  dueDate?: Date | null;

  @Field(() => RelatedUser)
  createdBy!: RelatedUser;

  @Field(() => [TaskChecklist], { defaultValue: [] })
  checklist!: TaskChecklist[];

  @Field(() => [TaskComment], { defaultValue: [] })
  comments!: TaskComment[];

  @Field(() => Date, { nullable: true })
  startDate?: Date | null;

  @Field(() => Date, { nullable: true })
  completedAt?: Date | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => [RelatedUser], { defaultValue: [] })
  assignedTo!: RelatedUser[];
}
