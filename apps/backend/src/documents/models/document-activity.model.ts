import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedUser, User } from '../../auth/types/auth.types.js';
import { RelatedDocument } from './related-types.js';

@ObjectType()
export class DocumentActivity {
  @Field(() => ID)
  id!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID)
  documentId!: string;

  @Field(() => String)
  activityType!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => RelatedUser)
  user!: RelatedUser;

  @Field()
  userId!: string;

  @Field(() => JSON, { nullable: true })
  metadata?: any;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class RelatedDocumentActivity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  activityType!: string;

  @Field(() => String)
  userId!: string;
}