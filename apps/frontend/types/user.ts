import { Role } from "./auth";

export interface RelatedUser{
  id: string;
  email: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  status: UserStatus;
  emailVerified?: Date;
  phoneVerified?: Date;
  twoFactorEnabled: boolean;
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  role: Role;
  assignedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatar?: string;
  title?: string;
  specializations: string[];
  activeListings: number;
  rating?: number;
}

export interface Company {
  id: string;
  name: string;
  type: string;
  status: string;
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  phone?: string;
  firstName: string;
  lastName: string;
  companyId?: string;
}
