import { User, UserRole } from "./user";
  
export interface Permission {
  id: String,
  name: String,
  description?: String,
  resourceCode: String,
  bit: number;
  slug: String;
  allowedRoles: Role[];
};

export interface Role{
    id: string;
    name: string;
    description?: string;
    hierarchy: number;
    users: UserRole[];
    permissions: Permission[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}