import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = mockUsers.find((u) => u.username === body.username && u.password === body.password);

  if (!user) {
    return mockFailure('Sai username hoặc password', { status: 400, code: 'MSG-LG-02' });
  }

  return mockSuccess(
    {
      token: `mock.${user.id}.${Date.now()}`,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        platform_access: 'web',
      },
    },
    { code: 'MSG-LG-01', message: 'Đăng nhập thành công' }
  );
}
