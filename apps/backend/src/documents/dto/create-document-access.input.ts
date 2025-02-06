import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateDocumentAccessInput {
  @Field(() => ID)
  @IsUUID()
  documentId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  teamId?: string;

  @Field(() => ID)
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  canView: boolean = true;

  @Field({ defaultValue: false })
  @IsBoolean()
  canEdit: boolean = false;

  @Field({ defaultValue: false })
  @IsBoolean()
  canDelete: boolean = false;

  @Field({ defaultValue: false })
  @IsBoolean()
  canShare: boolean = false;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  validFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  validUntil?: Date;

  // Remove grantedBy as it will be set by the service
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  grantedAt?: Date;
}
