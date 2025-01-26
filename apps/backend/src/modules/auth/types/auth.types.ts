import { ObjectType, Field } from '@nestjs/graphql';
import type { User } from '@sovereign/database';

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  accessToken: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class TwoFactorResponse {
  @Field(() => String)
  secret: string;

  @Field(() => String)
  qrCodeUrl: string;
}

@ObjectType()
export class SecurityLog {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  action: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  ip?: string;

  @Field(() => String, { nullable: true })
  device?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class LoginHistory {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  device?: string;

  @Field(() => String, { nullable: true })
  ip?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field(() => Date)
  createdAt: Date;
}
