import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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

  @Field({ nullable: true })
  comments?: string;

  @Field({ nullable: true })
  step?: number;

  @Field({ nullable: true })
  sequence?: number;

  @Field({ nullable: true })
  approvedAt?: Date;
}
