import { User } from './user';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export interface UserAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isVerified: boolean;
}

export interface UserLicense {
  id: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  isVerified: boolean;
}

export interface UserCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  isVerified: boolean;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  proficiency: string;
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  user?: User;
  lastName: string;
  displayName?: string;
  bio?: string;
  coverImage?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationality?: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  whatsapp?: string;
  address?: UserAddress;
  title?: string;
  specializations: string[];
  licenses: UserLicense[];
  certifications: UserCertification[];
  experience?: number;
  activeListings: number;
  rating?: number;
  reviewCount: number;
  languages: Language[];
  timeZone: string;
  currency: string;
  socialLinks?: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  lastName?: string;
  displayName?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  nationality?: string;
  secondaryEmail?: string;
  secondaryPhone?: string;
  whatsapp?: string;
  title?: string;
  specializations?: string[];
  experience?: number;
  timeZone?: string;
  currency?: string;
  socialLinks?: SocialLinks;
}

export interface AddressInput {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface LicenseInput {
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
}

export interface CertificationInput {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
}

export interface LanguageInput {
  code: string;
  name: string;
  proficiency: string;
}
