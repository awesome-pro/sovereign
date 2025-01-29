import { useAuth } from './useAuth';

export function useRoles() {
  const { user } = useAuth();
  const roles = new Set(user?.roles.map(role => role.name) || []);

  return {
    // Check if user has a specific role
    hasRole: (role: keyof typeof ROLES) => roles.has(role),
    
    // Check if user has any of the specified roles
    hasAnyRole: (requiredRoles: Array<keyof typeof ROLES>) => 
      requiredRoles.some(role => roles.has(role)),
    
    // Check if user has all specified roles
    hasAllRoles: (requiredRoles: Array<keyof typeof ROLES>) => 
      requiredRoles.every(role => roles.has(role)),
    
    // Get all roles
    getAllRoles: () => Array.from(roles),
    
    // Specific role checks for real estate
    isAdmin: () => roles.has(ROLES.SUPER_ADMIN) || roles.has(ROLES.COMPANY_ADMIN),
    isAgent: () => roles.has(ROLES.AGENT) || roles.has(ROLES.SENIOR_AGENT),
    isBroker: () => roles.has(ROLES.BROKER),
    
    // Get highest role level (useful for UI decisions)
    getHighestRole: () => {
      const roleHierarchy = [
        ROLES.SUPER_ADMIN,
        ROLES.COMPANY_ADMIN,
        ROLES.SALES_MANAGER,
        ROLES.SENIOR_AGENT,
        ROLES.AGENT,
        ROLES.BROKER,
        ROLES.VIEWER
      ];
      
      return roleHierarchy.find(role => roles.has(role));
    }
  };
}