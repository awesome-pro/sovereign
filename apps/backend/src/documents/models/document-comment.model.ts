import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedDocument } from './related-types.js';
import { RelatedUser } from '../../auth/types/auth.types.js';

@ObjectType()
export class DocumentComment {
  @Field(() => ID)
  id!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field()
  documentId!: string;

  @Field()
  content!: string;

  @Field(() => Number, { nullable: true })
  page?: number;

  @Field(() => JSON, { nullable: true })
  position?: any;

  @Field(() => RelatedUser)
  user!: RelatedUser;

  @Field()
  userId!: string;

  @Field(() => RelatedDocumentComment, { nullable: true })
  parent?: RelatedDocumentComment;

  @Field({ nullable: true })
  parentId?: string;

  @Field(() => [RelatedDocumentComment])
  replies!: RelatedDocumentComment[];

  @Field()
  resolved!: boolean;

  @Field(() => String, { nullable: true })
  resolvedBy?: string;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

export class RelatedDocumentComment {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  content!: string;

  @Field(() => ID)
  userId!: string;
}