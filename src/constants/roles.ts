export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  LEADER_STAFF: 'LEADER_STAFF',
  TECHNICAL_STAFF: 'TECHNICAL_STAFF',
} as const;

export const ROLE_DASHBOARD_PATH: Record<string, string> = {
  Admin: '/admin/dashboard',
  Manager: '/manager/dashboard',
};

// Doc mới (docs/api/02-users-roles.md) không còn endpoint GET /roles — role là enum cố định.
export const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'LEADER_STAFF', label: 'Leader Staff' },
  { value: 'TECHNICAL_STAFF', label: 'Technical Staff' },
];
