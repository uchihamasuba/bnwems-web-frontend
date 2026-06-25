import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

const VALID_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'LOCKED']);

// UC 2.4 — PUT /api/v1/users/:id/status (docs/api/02-users-roles.md)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    return mockFailure('User not found', { status: 404 });
  }

  const body = await request.json();
  if (!VALID_STATUSES.has(body.status)) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC04-01' });
  }

  user.status = body.status;

  return mockSuccess(null, { message: 'User status updated successfully' });
}
