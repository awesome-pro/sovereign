import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateDocumentShareInput {
  @Field(() => ID)
  @IsUUID()
  documentId!: string;

  @Field()
  @IsString()
  shareType!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shareWith?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  viewLimit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}
