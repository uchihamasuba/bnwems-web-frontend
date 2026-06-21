import { mockSuccess } from '@/lib/mock-response';
import { mockUsers } from '@/mocks/seed';

export async function GET() {
  const user = mockUsers[1];
  return mockSuccess({
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: 'a@binhnguyen.vn',
    phone: '0901234567',
    role: user.role,
    status: 'active',
    created_at: '2026-01-10T08:00:00Z',
  });
}
