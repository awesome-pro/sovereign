import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DocumentStatus, DocumentSecurity, DocumentType, Language } from '@prisma/client';
import { RelatedUser } from '../../auth/types/auth.types.js';
import { RelatedFile, RelatedDocument } from './related-types.js';
import { RelatedDocumentAccess } from './document-access.model.js';
/// import { DocumentWorkflow } from './document-workflow.model.js';
import { RelatedDocumentComment } from './related-types.js';
import { DocumentShare } from './document-share.model.js';
import { DocumentApproval } from './document-approval.model.js';
import { RelatedTransaction } from '../../transactions/dto/transaction.dto.js';
import { RelatedDocumentActivity } from './document-activity.model.js';


registerEnumType(DocumentStatus, { name: 'DocumentStatus' });
registerEnumType(DocumentSecurity, { name: 'DocumentSecurity' });
registerEnumType(DocumentType, { name: 'DocumentType' });
registerEnumType(Language, { name: 'Language' });

@ObjectType()
export class Document {
  @Field(() => ID)
  id!: string;

  @Field()
  referenceNumber!: string;

  @Field(() => DocumentType)
  type!: DocumentType;

  @Field(() => DocumentStatus)
  status!: DocumentStatus;

  @Field(() => DocumentSecurity)
  security!: DocumentSecurity;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Language)
  language!: Language;

  @Field(() => String)
  version!: string;

  // @Field(() => [DealParty], { nullable: true })
  // dealParties?: DealParty[];

  @Field(() => [RelatedFile])
  files!: RelatedFile[];

  @Field(() => [String], { nullable: true })
  categories?: string[];


  @Field(() => [RelatedDocumentAccess])
  accesses!: RelatedDocumentAccess[];

  // @Field(() => [RelatedDocumentShare])
  // shareLinks!: RelatedDocumentShare[];

  // @Field(() => DocumentWorkflow, { nullable: true })
  // workflow?: DocumentWorkflow;

  // @Field(() => [RelatedDocumentApproval])
  // approvals!: RelatedDocumentApproval[];

  @Field(() => RelatedDocument, { nullable: true })
  parent?: RelatedDocument;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => [RelatedDocument])
  versions!: RelatedDocument[];

  @Field(() => Boolean, { defaultValue: false })
  isTemplate!: boolean;

  // @Field(() => [RelatedDocumentView])
  // views: RelatedDocumentView[];

  @Field(() => [RelatedDocumentActivity])
  activities!: RelatedDocumentActivity[];

  @Field(() => [RelatedDocumentComment])
  comments!: RelatedDocumentComment[];

  @Field(() => Date, { nullable: true })
  validFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null;

  @Field(() => Number, { nullable: true })
  retentionPeriod?: number | null;

  @Field(() => [RelatedTransaction])
  transactions!: RelatedTransaction[];

  @Field(() => RelatedUser)
  createdBy!: RelatedUser;

  @Field(() => ID)
  createdById!: string;

  @Field(() => ID)
  companyId!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}