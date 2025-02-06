import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender options'
});

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

  @Field(() => Boolean)
  isVerified!: boolean;
}

@ObjectType()
export class UserLicense {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field()
  number!: string;

  @Field()
  issuingAuthority!: string;

  @Field(() => Date)
  issueDate!: Date;

  @Field(() => Date)
  expiryDate!: Date;

  @Field(() => Boolean)
  isVerified!: boolean;
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

  @Field(() => Boolean)
  isVerified!: boolean;
}

// @ObjectType()
// export class Language {
//   @Field(() => ID)
//   id!: string;

//   @Field()
//   code!: string;

//   @Field()
//   name!: string;

//   @Field()
//   proficiency!: string;
// }

@ObjectType()
export class SocialLinks {
  @Field(() => String, { nullable: true })
  linkedin?: string;

  @Field(() => String, { nullable: true })
  twitter?: string;

  @Field(() => String, { nullable: true })
  facebook?: string;

  @Field(() => String, { nullable: true })
  instagram?: string;

  @Field(() => String, { nullable: true })
  website?: string;
}

@ObjectType()
export class CompleteUserProfile {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  lastName!: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  coverImage?: string;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => String, { nullable: true })
  nationality?: string;

  @Field(() => String, { nullable: true })
  secondaryEmail?: string;

  @Field(() => String, { nullable: true })
  secondaryPhone?: string;

  @Field(() => String, { nullable: true })
  whatsapp?: string;

  @Field(() => UserAddress, { nullable: true })
  address?: UserAddress;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => [String])
  specializations!: string[];

  @Field(() => [UserLicense])
  licenses!: UserLicense[];

  @Field(() => [UserCertification])
  certifications!: UserCertification[];

  @Field(() => Number, { nullable: true })
  experience?: number;

  @Field(() => Number)
  activeListings!: number;

  @Field(() => Number, { nullable: true })
  rating?: number;

  @Field(() => Number)
  reviewCount!: number;

  // @Field(() => [Language])
  // languages!: Language[];

  @Field()
  timeZone!: string;

  @Field()
  currency!: string;

  @Field(() => SocialLinks, { nullable: true })
  socialLinks?: SocialLinks;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@InputType()
export class SocialLinksInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  twitter?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  facebook?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  instagram?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  website?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  dateOfBirth?: Date;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  gender?: Gender;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  specializations?: string[];

  @Field(() => Number, { nullable: true })
  @IsOptional()
  experience?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeZone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @Field(() => SocialLinksInput, { nullable: true })
  @IsOptional()
  socialLinks?: SocialLinksInput;
}

@InputType()
export class AddressInput {
  @Field()
  @IsString()
  street!: string;

  @Field()
  @IsString()
  city!: string;

  @Field()
  @IsString()
  state!: string;

  @Field()
  @IsString()
  country!: string;

  @Field()
  @IsString()
  postalCode!: string;
}

@InputType()
export class LicenseInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  @IsString()
  number!: string;

  @Field()
  @IsString()
  issuingAuthority!: string;

  @Field(() => Date)
  issueDate!: Date;

  @Field(() => Date)
  expiryDate!: Date;
}

@InputType()
export class CertificationInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  issuingOrganization!: string;

  @Field(() => Date)
  issueDate!: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiryDate?: Date;
}

@InputType()
export class LanguageInput {
  @Field()
  @IsString()
  code!: string;

  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  proficiency!: string;
}
