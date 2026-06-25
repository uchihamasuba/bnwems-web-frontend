// UC 2.1, 2.2 (docs/api/01-auth.md)

export type UserRole = 'ADMIN' | 'MANAGER' | 'LEADER_STAFF' | 'TECHNICAL_STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
}

// GET /api/v1/auth/profile
export interface AuthProfile extends AuthUser {
  createdAt: string;
  updatedAt: string;
}
