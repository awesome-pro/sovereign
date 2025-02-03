import { ObjectType, Field, ID, registerEnumType, OmitType } from '@nestjs/graphql';
import { UserStatus } from '@sovereign/database';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

@ObjectType()
export class RelatedUser {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class JWTRole {
  @Field()
  roleHash!: string;

  @Field()
  hierarchy!: number;

  @Field(() => String, { nullable: true })
  parentRoleHash!: string | null;
}

@ObjectType()
export class UserPermission {
  @Field()
  resourceCode!: string;

  @Field()
  bit!: number;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  @Field(() => Date, { nullable: true })
  emailVerified?: Date | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => Date, { nullable: true })
  phoneVerified?: Date | null;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [JWTRole])
  roles!: JWTRole[];

  @Field(() => [UserPermission])
  permissions!: UserPermission[];

  @Field(() => Boolean, { nullable: true })
  twoFactorEnabled!: boolean | null;
}

export class CompleteUser extends User {

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

  // @Field(() => [UserRole])
  // users!: UserRole[];

  @Field(() => [Permission])
  permissions!: Permission[];

}


@ObjectType()
export class UserRole {
  @Field(() => ID)
  id!: string;

  @Field(() => Role)
  role!: Role;

  @Field()
  assignedAt!: Date;
}

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  coverImage?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  nationality?: string;

  @Field({ nullable: true })
  secondaryEmail?: string;

  @Field({ nullable: true })
  secondaryPhone?: string;

  @Field({ nullable: true })
  whatsapp?: string;

  // @Field(() => UserAddress, { nullable: true })
  // address?: UserAddress;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [String])
  specializations!: string[];

  // @Field(() => [UserLicense])
  // licenses!: UserLicense[];

  // @Field(() => [UserCertification])
  // certifications!: UserCertification[];

  @Field({ nullable: true })
  experience?: number;

  @Field({ nullable: true })
  activeListings?: number;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  reviewCount?: number;

  // @Field(() => [Language])
  // languages!: Language[];

  @Field()
  timeZone!: string;

  @Field()
  currency!: string;

  // @Field(() => GraphQLJSON, { nullable: true })
  // socialLinks?: any;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}


@ObjectType()
export class CompleteRole extends Role {
  @Field(() => [UserRole])
  users!: UserRole[];

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
  resourceCode!: string;

  @Field()
  slug!: string;

  @Field()
  bit!: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Role])
  allowedRoles!: Role[];

  @Field(() => Date)  
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class AuthResponse {
  @Field({ nullable: true })
  accessTokenExpiry?: number; // UNIX timestamp or similar, if needed for UI notifications

  @Field(() => User)
  user!: User;
}

@ObjectType()
export class AuthServiceResponse {
  @Field(() => String)
  accessToken!: string;

  @Field(() => String)
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

  @Field()
  ip!: string;

  @Field()
  userAgent!: string;

  @Field()
  success!: boolean;

  @Field({ nullable: true })
  description?: string;

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

@ObjectType()
export class UserSession {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string | null;

  @Field(() => String, { nullable: true })
  ipHash?: string | null;

  @Field(() => String, { nullable: true })
  deviceHash?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => Date, { nullable: true })
  lastActivity?: Date | null;

  @Field(() => Date)
  expiresAt!: Date;

  @Field(() => Date, { nullable: true })
  revokedAt?: Date | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field(() => Boolean)
  revoked!: boolean;

  @Field(() => Date)
  createdAt!: Date;
}
