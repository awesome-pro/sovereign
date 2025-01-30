import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsUUID, IsDate, Max, IsPhoneNumber } from 'class-validator';
import { PermissionCategory } from '@sovereign/database';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  password!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  twoFactorToken?: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  password!: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @Field()
  @IsString()
  @MinLength(1)
  firstName!: string;

  @Field()
  @IsString()
  lastName!: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  companyId?: string;
}

@InputType()
export class RefreshTokenInput {
  @Field()
  @IsString()
  refreshToken!: string;
}

@InputType()
export class TwoFactorTokenInput {
  @Field()
  @IsString()
  token!: string;
}

@InputType()
export class SecurityLogsInput {
  @Field()
  @IsUUID()
  userId!: string;

  @Field()
  @IsDate()
  startDate!: Date;

  @Field()
  @IsDate()
  endDate!: Date;
}

@InputType()
export class LoginHistoryInput {
  @Field(() => Int, { defaultValue: 10 })
  @Max(100)
  limit!: number;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  token!: string;

  @Field()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

@InputType()
export class AssignRoleInput {
  @Field(() => ID)
  @IsString()
  userId!: string;

  @Field(() => ID)
  @IsString()
  roleId!: string;
}

@InputType()
export class CreateRoleInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class UpdateRoleInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  slug!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => PermissionCategory)
  @IsEnum(PermissionCategory)
  category!: PermissionCategory;
}

@InputType()
export class UpdatePermissionInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => PermissionCategory, { nullable: true })
  @IsEnum(PermissionCategory)
  @IsOptional()
  category?: PermissionCategory;
}
