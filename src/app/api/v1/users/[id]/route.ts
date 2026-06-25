import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

// UC 2.4 — PUT /api/v1/users/:id (docs/api/02-users-roles.md)
// Không thể cập nhật username (BR-04-01).
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = mockUsers.find((u) => u.id === id);
  if (!user) {
    return mockFailure('User not found', { status: 404 });
  }

  const body = await request.json();
  if (body.fullName) user.fullName = body.fullName;
  if (body.role) user.role = body.role;

  return mockSuccess(null, { message: 'User updated successfully' });
}
