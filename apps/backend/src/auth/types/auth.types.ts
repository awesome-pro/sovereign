import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { User as PrismaUser, UserStatus } from '@sovereign/database';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

@ObjectType('User')
export class UserType implements Partial<PrismaUser> {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => Date, { nullable: true })
  emailVerified?: Date;

  @Field(() => Date, { nullable: true })
  phoneVerified?: Date;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [String])
  roles!: string[];

  @Field(() => Boolean)
  twoFactorEnabled!: boolean;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  accessToken!: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;

  @Field(() => UserType, { nullable: true })
  user?: UserType;
}

@ObjectType()
export class TwoFactorResponse {
  @Field(() => String)
  secret!: string;

  @Field(() => String)
  qrCodeUrl!: string;
}

@ObjectType()
export class SecurityLog {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String)
  action!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  ip?: string;

  @Field(() => String, { nullable: true })
  device?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  userEmail?: string;

  @Field(() => String, { nullable: true })
  userName?: string;
}

@ObjectType()
export class DeviceInfo {
  @Field(() => String)
  browser!: string;

  @Field(() => String)
  os!: string;

  @Field(() => String)
  device!: string;
}

@ObjectType()
export class LoginHistory {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String, { nullable: true })
  device?: string;

  @Field(() => String, { nullable: true })
  ip?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String, { nullable: true })
  reason?: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => String, { nullable: true })
  userEmail?: string;

  @Field(() => DeviceInfo, { nullable: true })
  deviceInfo?: DeviceInfo;
}
