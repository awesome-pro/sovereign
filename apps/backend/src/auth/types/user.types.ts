import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { UserStatus } from "@sovereign/database";
import { Role } from "./auth.types.js";

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

  @Field({ nullable: true })
  emailVerified?: Date;

  @Field({ nullable: true })
  phoneVerified?: Date;

  @Field(() => UserStatus)
  status!: UserStatus;

  @Field(() => [String])
  roles!: string[];

  @Field()
  twoFactorEnabled!: boolean;

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
