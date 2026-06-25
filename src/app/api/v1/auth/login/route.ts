import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

// UC 2.1 — POST /api/v1/auth/login (docs/api/01-auth.md)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = mockUsers.find((u) => u.username === body.username && u.password === body.password);

  if (!user) {
    return mockFailure('Invalid username or password', { status: 400, code: 'MSG-UC01-02' });
  }
  if (user.status !== 'ACTIVE') {
    return mockFailure('Account is locked or inactive', { status: 403, code: 'MSG-UC01-03' });
  }

  return mockSuccess(
    {
      token: `mock.${user.id}.${Date.now()}`,
      expiresIn: 86400,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    },
    { message: 'Login successful' }
  );
}
