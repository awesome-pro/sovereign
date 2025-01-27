import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { UserStatus } from '@sovereign/database';

registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

@ObjectType()
export class Role {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [UserRole])
  users!: UserRole[];
}

@ObjectType()
export class RoleWithMetadata extends Role {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
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
export class Company {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  status!: string;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  emailVerified?: Date;

  @Field({ nullable: true })
  phoneVerified?: Date;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [UserRole])
  roles!: UserRole[];

  @Field()
  twoFactorEnabled!: boolean;

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
  secret!: string;

  @Field()
  qrCodeUrl!: string;
}

@ObjectType()
export class SecurityLog {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  action?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  device?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt?: Date;
}

@ObjectType()
export class LoginHistory {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field({ nullable: true })
  device?: string;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  success!: boolean;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  createdAt?: Date;
}

@ObjectType()
export class VerificationResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
