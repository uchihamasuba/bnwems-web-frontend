// UC 2.4 (docs/api/02-users-roles.md)
// Lưu ý: doc mới không còn entity `Role`/endpoint GET /roles riêng — role là enum cố định
// (ADMIN/MANAGER/LEADER_STAFF/TECHNICAL_STAFF), không gán qua endpoint riêng mà sửa trực
// tiếp trong PUT /users/:id. Email/phone cũng không còn có trong response của module này.

export type UserRole = 'Admin' | 'Manager' | 'LEADER_STAFF' | 'TECHNICAL_STAFF';
export type UserStatus = 'active' | 'inactive' | 'locked';

// GET /api/v1/users
export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

// POST /api/v1/users
export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

// PUT /api/v1/users/:id
export interface UpdateUserPayload {
  fullName: string;
  role: UserRole;
}

// PATCH /api/v1/users/:id/status
export interface UpdateUserStatusPayload {
  status: 'active' | 'inactive';
}

// PATCH /api/v1/users/:id/reset-password
export interface ResetPasswordPayload {
  newPassword: string;
}
