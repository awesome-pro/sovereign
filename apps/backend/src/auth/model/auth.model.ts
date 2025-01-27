// src/graphql/models/user.model.ts
import { ObjectType, Field, ID, registerEnumType, InputType } from '@nestjs/graphql';
import { UserStatus } from '@prisma/client';
import { IsDateString, IsEmail, IsPhoneNumber, MinLength } from 'class-validator';

// Register enums for GraphQL
registerEnumType(UserStatus, {
  name: 'UserStatus',
  description: 'User account status',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => Date, { nullable: true })
  emailVerified?: Date;

  @Field(() => Date, { nullable: true })
  phoneVerified?: Date;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => Boolean)
  twoFactorEnabled!: boolean;

  @Field(() => [UserRole])
  roles!: UserRole[];

  // We don't expose the password field in GraphQL
}

@ObjectType() 
export class UserWithMetadata extends User {
  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile;
}

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

  @Field(() => User)
  user!: User;

  @Field()
  userId!: string;

  @Field(() => Role)
  role!: Role;

  @Field()
  roleId!: string;

  @Field({ nullable: true })
  assignedBy?: string;

  @Field(() => Date)
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

  @Field(() => UserAddress, { nullable: true })
  address?: UserAddress;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [String])
  specializations!: string[];

  @Field(() => [UserLicense])
  licenses!: UserLicense[];

  @Field(() => [UserCertification])
  certifications!: UserCertification[];

  @Field({ nullable: true })
  experience?: number;

  @Field({ nullable: true })
  activeListings?: number;

  @Field({ nullable: true })
  rating?: number;

  @Field({ nullable: true })
  reviewCount?: number;

  @Field(() => [Language])
  languages!: Language[];

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
export class UserAddress {
  @Field(() => ID)
  id!: string;

  @Field()
  street!: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  country!: string;

  @Field()
  postalCode!: string;
}

@ObjectType()
export class UserLicense {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  number!: string;

  @Field(() => Date)
  issuedDate!: Date;

  @Field(() => Date)
  expiryDate!: Date;

  @Field()
  issuingAuthority!: string;
}

@ObjectType()
export class UserCertification {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  issuingOrganization!: string;

  @Field(() => Date)
  issueDate!: Date;

  @Field(() => Date, { nullable: true })
  expiryDate?: Date;
}

@ObjectType()
export class Language {
  @Field(() => ID)
  id!: string;

  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  proficiency!: string;
}

// Input types for mutations
@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  password!: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  phone?: string;

  @Field(() => CreateUserProfileInput)
  profile?: CreateUserProfileInput;
}

@InputType()
export class CreateUserProfileInput {
  @Field()
  @MinLength(2)
  firstName!: string;

  @Field()
  @MinLength(2)
  lastName!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field(() => [String], { nullable: true })
  specializations?: string[];

  @Field(() => String, { nullable: true })
  timeZone?: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsPhoneNumber()
  phone?: string;

  @Field(() => UpdateUserProfileInput, { nullable: true })
  profile?: UpdateUserProfileInput;
}

@InputType()
export class UpdateUserProfileInput {
  @Field({ nullable: true })
  @MinLength(2)
  firstName?: string;

  @Field({ nullable: true })
  @MinLength(2)
  lastName?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  @IsDateString()
  dateOfBirth?: string;

  @Field(() => [String], { nullable: true })
  specializations?: string[];
}