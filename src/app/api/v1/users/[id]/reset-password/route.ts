import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

// UC 2.4 — POST /api/v1/users/:id/reset-password (docs/api/02-users-roles.md)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    return mockFailure('User not found', { status: 404 });
  }

  const body = await request.json();
  if (!body.newPassword) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC04-01' });
  }
  user.password = body.newPassword;

  return mockSuccess(null, { message: 'User password reset successfully' });
}
