import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedDocument } from './related-types.js';

@ObjectType()
export class DocumentShare {
  @Field(() => ID)
  id!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID)
  documentId!: string;

  @Field(() => String)
  shareType!: string;

  @Field(() => String, { nullable: true })
  shareWith?: string | null;

  @Field(() => String, { nullable: true })
  password?: string | null;

  @Field(() => Number, { nullable: true })
  viewLimit?: number;

  @Field(() => Number)
  viewCount!: number;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => ID)
  createdBy!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date, { nullable: true })
  lastAccessedAt?: Date | null;
}
