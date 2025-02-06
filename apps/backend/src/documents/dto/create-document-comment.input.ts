import { Field, ID, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export enum DocumentCommentType {
  GENERAL = 'GENERAL',
  ANNOTATION = 'ANNOTATION',
  REVIEW = 'REVIEW',
  REPLY = 'REPLY'
}

registerEnumType(DocumentCommentType, { name: 'DocumentCommentType' });

@InputType()
export class CreateDocumentCommentInput {
  @Field(() => ID)
  @IsUUID()
  documentId!: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @Field(() => String)
  @IsString()
  content!: string;

  @Field(() => DocumentCommentType)
  @IsEnum(DocumentCommentType)
  type!: DocumentCommentType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  page?: number | null;

  // @Field(() => JSON, { nullable: true })
  // @IsOptional()
  // position?: any | null;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  resolved: boolean = false;
}
