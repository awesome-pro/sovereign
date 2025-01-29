import { User, UserRole } from "./user";

enum PermissionCategory {
    VIEW = 'VIEW',        
    EDIT = 'EDIT',        
    DELETE = 'DELETE',      
    MANAGE = 'MANAGE',      
    SHARE = 'SHARE',       
    COMMUNICATE = 'COMMUNICATE', 
  }
  

export interface Permission {
  id: String,
  category: PermissionCategory,
  name: String,
  description?: String,
  code: String,
  allowedRoles: Role[],
};

export interface Role{
    id: string;
    name: string;
    description?: string;
    users: UserRole[];
    permissions: Permission[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  roles: string[];
  permissions: string[];
  error?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
