// UC 2.4 (docs/api/02-users-roles.md)
// Doc mới: user trả về role dạng object { roleId, roleName } (không còn field role phẳng như
// trước); tạo/sửa user gửi roleId thay vì role string. Không còn endpoint GET /roles để tra
// roleId theo từng vai trò — FE tự suy ra roleId từ danh sách user đã có (xem
// app/admin/settings/users/page.tsx). status đổi từ UPPERCASE ('ACTIVE'...) sang lowercase
// ('active'...), không còn giá trị 'LOCKED'; đổi trạng thái dùng PATCH (không phải PUT).

import type { UserRole } from './auth';

export interface UserRoleRef {
  roleId: string;
  roleName: UserRole;
}

export type UserStatus = 'active' | 'inactive';

// GET /api/v1/users
export interface AdminUser {
  userId: string;
  username: string;
  fullName: string;
  role: UserRoleRef;
  status: UserStatus;
  createdAt: string;
}

// POST /api/v1/users
export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  roleId: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

// PUT /api/v1/users/:id
export interface UpdateUserPayload {
  fullName: string;
  roleId: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

// PATCH /api/v1/users/:id/status
export interface UpdateUserStatusPayload {
  status: UserStatus;
}

// POST /api/v1/users/:id/reset-password
export interface ResetPasswordPayload {
  newPassword: string;
}
