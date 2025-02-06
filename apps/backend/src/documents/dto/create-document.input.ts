import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { DocumentSecurity, Language, DocumentType } from '../../common/enums/graphql-enums.js';

@InputType()
export class CreateDocumentInput {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title!: string;

  @Field(() => DocumentType)
  @IsEnum(DocumentType)
  type!: DocumentType;

  @Field(() => DocumentSecurity)
  @IsEnum(DocumentSecurity)
  security!: DocumentSecurity;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string | null;

  @Field(() => Language)
  @IsEnum(Language)
  language!: Language;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  categories?: string[] | null;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[] | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isTemplate?: boolean | null;

  // @Field(() => JSON, { nullable: true })
  // @IsOptional()
  // templateFields?: any | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  validFrom?: Date | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiresAt?: Date | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  retentionPeriod?: number | null;
}
