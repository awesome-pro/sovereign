import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { RelatedDocument, RelatedDocumentComment } from './related-types.js';
import { RelatedUser } from '../../auth/types/auth.types.js';

@ObjectType()
export class DocumentComment {
  @Field(() => ID)
  id!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID)
  documentId!: string;

  @Field(() => String)
  content!: string;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => RelatedUser)
  user!: RelatedUser;

  @Field(() => ID)
  userId!: string;

  @Field(() => DocumentComment, { nullable: true })
  parent?: DocumentComment | null;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => [DocumentComment])
  replies!: DocumentComment[];

  @Field(() => Boolean, { defaultValue: false })
  resolved!: boolean;

  @Field(() => ID, { nullable: true })
  resolvedBy?: string | null;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date | null;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
