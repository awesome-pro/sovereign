import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateDocumentCommentInput {
  @Field(() => ID)
  @IsUUID()
  documentId!: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  parentId!: string | null;

  @Field()
  @IsString()
  content!: string;

  @Field()
  @IsString()
  type!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  page?: number;

  @Field(() => JSON, { nullable: true })
  @IsOptional()
  position?: any;

  @Field({ defaultValue: false })
  @IsBoolean()
  resolved: boolean = false;
}
