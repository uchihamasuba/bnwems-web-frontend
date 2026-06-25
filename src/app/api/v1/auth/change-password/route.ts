import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { getCurrentUserIdFromRequest } from '@/lib/mock-auth';
import { mockUsers } from '@/mocks/seed';

// UC 2.2 — PUT /api/v1/auth/change-password (docs/api/01-auth.md)
export async function PUT(request: NextRequest) {
  const currentUserId = getCurrentUserIdFromRequest(request);
  const user = mockUsers.find((u) => u.id === currentUserId);
  if (!user) {
    return mockFailure('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  if (user.password !== body.oldPassword) {
    return mockFailure('Password change failed (old password incorrect).', { status: 400, code: 'MSG-UC02-01' });
  }
  if (!body.newPassword || body.newPassword !== body.confirmNewPassword) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC01-01' });
  }

  user.password = body.newPassword;

  return mockSuccess(null, { message: 'Password changed successfully.' });
}
