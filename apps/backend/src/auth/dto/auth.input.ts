import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  twoFactorToken?: string;
}

@InputType()
export class RefreshTokenInput {
  @Field(() => String)
  @IsString()
  refreshToken!: string;
}

@InputType()
export class TwoFactorTokenInput {
  @Field(() => String)
  @IsString()
  token!: string;
}

@InputType()
export class SecurityLogsInput {
  @Field(() => String)
  @IsString()
  userId!: string;

  @Field(() => Date)
  startDate!: Date;

  @Field(() => Date)
  endDate!: Date;
}

@InputType()
export class LoginHistoryInput {
  @Field(() => Number, { defaultValue: 10 })
  limit: number = 10;
}
