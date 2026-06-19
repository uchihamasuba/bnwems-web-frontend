export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
} as const;

export const ROLE_DASHBOARD_PATH: Record<string, string> = {
  Admin: '/admin/dashboard',
  Manager: '/manager/dashboard',
};
