import { UserRole } from "./user";

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