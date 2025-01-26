export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  AGENT = 'AGENT',
  USER = 'USER',
}

export const RoleHierarchy = {
  [UserRole.SUPER_ADMIN]: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.AGENT,
    UserRole.USER,
  ],
  [UserRole.ADMIN]: [
    UserRole.ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.AGENT,
    UserRole.USER,
  ],
  [UserRole.COMPANY_ADMIN]: [
    UserRole.COMPANY_ADMIN,
    UserRole.AGENT,
    UserRole.USER,
  ],
  [UserRole.AGENT]: [UserRole.AGENT, UserRole.USER],
  [UserRole.USER]: [UserRole.USER],
};
