import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  IsUUID,
  Max,
  IsDate,
} from 'class-validator';

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
  @IsOptional()
  firstName!: string;

  @Field()
  @IsString()
  @IsOptional()
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
  password!: string;
}
