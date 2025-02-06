import { Field, InputType } from '@nestjs/graphql';
import { FileCategory, Language } from '@sovereign/database';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

@InputType()
export class UploadFileInput {
  @Field(() => GraphQLUpload)
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
