import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RelatedUser, User } from '../../auth/types/auth.types.js';
import { RelatedDocument } from './related-types.js';
import { DocumentFormat, Language, FileCategory } from '../../common/enums/graphql-enums.js';

@ObjectType()
export class File {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  fileName!: string;

  @Field(() => Number)
  fileSize!: number;

  @Field(() => DocumentFormat)
  fileType!: DocumentFormat;

  @Field(() => String)
  mimeType!: string;

  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  checksum?: string | null;

  @Field(() => String, { nullable: true })
  version?: string | null;

  @Field(() => Language)
  language!: Language;

  @Field(() => Boolean)
  notarized!: boolean;

  @Field()
  attested!: boolean;

  @Field(() => Date, { nullable: true })
  expiry?: Date | null;

  @Field(() => FileCategory)
  category!: FileCategory;

  @Field(() => RelatedDocument)
  document!: RelatedDocument;

  @Field(() => ID)
  documentId!: string;

  @Field(() => RelatedUser)
  uploadedBy!: RelatedUser;

  @Field(() => ID, { nullable: true })
  uploadedById?: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}


@ObjectType()
export class RelatedFile {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  fileName!: string;

  @Field(() => String)
  url!: string;

  @Field(() => Number)
  fileSize!: number;

  @Field(() => DocumentFormat)
  fileType!: DocumentFormat;
}