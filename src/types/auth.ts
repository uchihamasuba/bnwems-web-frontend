// UC 2.1, 2.2 (docs/api/01-auth.md)

export type UserRole = 'Admin' | 'Manager' | 'LEADER_STAFF' | 'TECHNICAL_STAFF';
export type AuthUserStatus = 'active' | 'inactive' | 'locked';

export interface AuthUserRole {
  roleId: string;
  roleName: UserRole;
}

export interface AuthUser {
  userId: string;
  username: string;
  fullName: string;
  role: AuthUserRole;
  status: AuthUserStatus;
}

// GET /api/v1/auth/profile
export interface AuthProfile extends AuthUser {
  createdAt: string;
  updatedAt: string;
}
