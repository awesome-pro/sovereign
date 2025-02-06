import { Field, InputType } from '@nestjs/graphql';
import { DocumentSecurity, DocumentType, Language } from '@sovereign/database';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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
  description?: string;

  @Field(() => Language)
  @IsEnum(Language)
  language!: Language;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isTemplate?: boolean;

  @Field(() => JSON, { nullable: true })
  @IsOptional()
  templateFields?: any;

  @Field({ nullable: true })
  @IsOptional()
  validFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  retentionPeriod?: number;
}
