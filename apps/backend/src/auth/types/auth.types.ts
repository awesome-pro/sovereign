import { ObjectType, Field, ID, registerEnumType, OmitType } from '@nestjs/graphql';
import { UserStatus, PermissionCategory } from '@sovereign/database';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

registerEnumType(PermissionCategory, {
  name: 'PermissionCategory',
  description: 'Permission category',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [String])
  roles!: string[];

  @Field(() => [String])
  permissions!: string[];

  @Field(() => Boolean)
  twoFactorEnabled!: boolean;
}

export class CompleteUser extends OmitType(User, ['permissions', 'roles']) {
  @Field(() => [Role])
  roles!: Role[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class Role {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Permission])
  permissions!: Permission[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

@ObjectType()
export class Permission {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => PermissionCategory)
  category!: PermissionCategory;

  @Field(() => [Role])
  allowedRoles!: Role[];

  @Field(() => Date)  
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => User)
  user!: User;
}

@ObjectType()
export class TwoFactorResponse {
  @Field()
  qrCodeUrl!: string;

  @Field()
  secret!: string;
}

@ObjectType()
export class SecurityLog {
  @Field(() => ID)
  id!: string;

  @Field(() => User)
  user!: User;

  @Field()
  eventType!: string;

  @Field()
  description!: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class LoginHistory {
  @Field(() => ID)
  id!: string;

  @Field(() => User)
  user!: User;

  @Field()
  ip!: string;

  @Field()
  userAgent!: string;

  @Field()
  success!: boolean;

  @Field({ nullable: true })
  failureReason?: string;

  @Field(() => Date)
  createdAt!: Date;
}

@ObjectType()
export class VerificationResponse {
  @Field()
  success!: boolean;

  @Field({ nullable: true })
  message?: string;
}
