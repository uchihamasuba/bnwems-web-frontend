import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { getCurrentUserIdFromRequest } from '@/lib/mock-auth';
import { mockUsers } from '@/mocks/seed';

// UC 2.2 — GET /api/v1/auth/profile (docs/api/01-auth.md)
export async function GET(request: NextRequest) {
  const currentUserId = getCurrentUserIdFromRequest(request);
  const user = mockUsers.find((u) => u.id === currentUserId);
  if (!user) {
    return mockFailure('Unauthorized', { status: 401 });
  }

  return mockSuccess({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.createdAt,
  });
}
