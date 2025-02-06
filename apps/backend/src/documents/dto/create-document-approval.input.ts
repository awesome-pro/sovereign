import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { DocumentApprovalStatus } from '@sovereign/database';

@InputType()
export class CreateDocumentApprovalInput {
  @Field(() => ID)
  @IsUUID()
  documentId!: string;

  @Field(() => ID)
  @IsUUID()
  approverId!: string;

  @Field(() => DocumentApprovalStatus)
  @IsEnum(DocumentApprovalStatus)
  status!: DocumentApprovalStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  comments?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  step?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;
}
