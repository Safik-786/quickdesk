export const ROLE = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  EMPLOYEE: 'EMPLOYEE',
  RBAC_MANAGER: 'RBAC_MANAGER',
} as const;

export type RoleType = (typeof ROLE)[keyof typeof ROLE];
