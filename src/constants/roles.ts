export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  LEADER_STAFF: 'LEADER_STAFF',
  TECHNICAL_STAFF: 'TECHNICAL_STAFF',
} as const;

export const ROLE_DASHBOARD_PATH: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  MANAGER: '/manager/dashboard',
};

// Doc mới (docs/api/02-users-roles.md) không còn endpoint GET /roles — role là enum cố định.
export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'LEADER_STAFF', label: 'Leader Staff' },
  { value: 'TECHNICAL_STAFF', label: 'Technical Staff' },
];
