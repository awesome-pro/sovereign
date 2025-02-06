import { Field, ID, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { RelatedDocument } from './related-types.js';
import { User } from '../../auth/types/auth.types.js';
import { DocumentApprovalStatus } from '@sovereign/database';

registerEnumType(DocumentApprovalStatus, { name: 'DocumentApprovalStatus' });

@ObjectType()
export class DocumentApproval {
  @Field(() => ID)
  id!: string;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID)
  documentId!: string;

  @Field(() => User)
  approver!: User;

  @Field(() => ID)
  approverId!: string;

  @Field(() => DocumentApprovalStatus)
  status!: DocumentApprovalStatus;

  @Field(() => String, { nullable: true })
  comments?: string | null;

  @Field(() => Int, { nullable: true })
  step?: number | null;

  @Field(() => Int, { nullable: true })
  sequence?: number | null;

  @Field(() => Date, { nullable: true })
  approvedAt?: Date | null;
}
