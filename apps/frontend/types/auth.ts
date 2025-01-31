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
  slug: String,
  allowedRoles: Role[],
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