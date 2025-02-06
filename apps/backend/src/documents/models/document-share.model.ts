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

  @Field({ nullable: true })
  password?: string | null;

  @Field({ nullable: true })
  viewLimit?: number;

  @Field()
  viewCount!: number;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  createdBy!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field({ nullable: true })
  lastAccessedAt?: Date;
}
