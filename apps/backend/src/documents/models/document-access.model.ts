import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedDocument } from './related-types.js';
import { RelatedUser } from '../../auth/types/auth.types.js';

@ObjectType()
export class DocumentAccess {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  documentId!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID, { nullable : true})
  userId?: string | null;

  @Field(() => RelatedUser, { nullable: true })
  user?: RelatedUser;

  @Field(() => ID, { nullable: true})
  teamId?: string | null;

  @Field(() => Boolean)
  canView!: boolean;

  @Field(() => Boolean)
  canEdit!: boolean;

  @Field(() => Boolean)
  canDelete!: boolean;

  @Field(() => Boolean)
  canShare!: boolean;

  @Field(() => Date, { nullable: true })
  validFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  validUntil?: Date | null;

  @Field()
  grantedBy!: string;

  @Field()
  grantedAt!: Date;

  @Field({ nullable: true })
  revokedAt?: Date;
}


@ObjectType()
export class RelatedDocumentAccess {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  documentId!: string;

  @Field(() => ID, { nullable: true })
  userId?: string | null;

  @Field(() => ID, { nullable: true })
  teamId?: string | null;

  @Field(() => Boolean)
  canView!: boolean;

  @Field(() => Boolean)
  canEdit!: boolean;

  @Field(() => Boolean)
  canDelete!: boolean;

  @Field(() => Boolean)
  canShare!: boolean;

  @Field(() => Date, { nullable: true })
  validFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  validUntil?: Date | null;
}