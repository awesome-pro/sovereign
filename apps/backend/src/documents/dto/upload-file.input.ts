import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { FileUpload } from 'graphql-upload/processRequest.mjs';
import { FileCategory, Language } from '../../common/enums/graphql-enums.js';
import { UploadScalar } from '../../common/scalars/upload.scalar.js';

@InputType()
export class UploadFileInput {
  @Field(() => UploadScalar)
  file!: Promise<FileUpload>;

  @Field(() => String)
  documentId!: string;

  @Field(() => FileCategory)
  @IsEnum(FileCategory)
  category!: FileCategory;

  @Field(() => Language, { defaultValue: Language.ENGLISH })
  @IsEnum(Language)
  language!: Language;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  version?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  notarized?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  attested?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiry?: Date;
}
