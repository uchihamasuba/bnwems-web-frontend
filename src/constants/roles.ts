export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  LEADER_STAFF: 'Leader Staff',
  TECHNICAL_STAFF: 'Technical Staff',
} as const;

export const ROLE_DASHBOARD_PATH: Record<string, string> = {
  Admin: '/admin/dashboard',
  Manager: '/manager/dashboard',
};

// Doc mới (docs/api/02-users-roles.md) không còn endpoint GET /roles — role là enum cố định.
// value khớp chính xác roleName trả về từ backend: "Admin, Manager, Leader Staff, Technical Staff".
export const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Leader Staff', label: 'Leader Staff' },
  { value: 'Technical Staff', label: 'Technical Staff' },
];
