export interface User {
  id: string;
  email: string;
  phone?: string;
  status: UserStatus;
  emailVerified?: Date;
  phoneVerified?: Date;
  twoFactorEnabled: boolean;
  roles: UserRole[];
  profile?: UserProfile;
  company?: Company;
}

export interface UserRole {
  id: string;
  role: {
    name: string;
    description?: string;
  };
  assignedAt: Date;
}

export interface UserProfile {
  id: string;
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
