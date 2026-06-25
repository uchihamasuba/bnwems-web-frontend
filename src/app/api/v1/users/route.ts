import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockUsers, nextId } from '@/mocks/seed';

// UC 2.4 — GET /api/v1/users (docs/api/02-users-roles.md)
function toUserResponse(user: (typeof mockUsers)[number]) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const role = params.get('role');
  const status = params.get('status');

  let result = [...mockUsers];

  if (search) {
    result = result.filter(
      (u) => u.username.toLowerCase().includes(search) || u.fullName.toLowerCase().includes(search)
    );
  }
  if (role) {
    result = result.filter((u) => u.role === role);
  }
  if (status) {
    result = result.filter((u) => u.status === status);
  }

  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged.map((u) => toUserResponse(u)), { meta: { page, limit, totalCount } });
}

// UC 2.4 — POST /api/v1/users (docs/api/02-users-roles.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.username || !body.password || !body.fullName || !body.role) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC04-01' });
  }

  if (mockUsers.some((u) => u.username === body.username)) {
    return mockFailure('Username already exists.', { status: 409, code: 'MSG-UC04-05' });
  }

  const newUser = {
    id: nextId('user'),
    username: body.username as string,
    password: body.password as string,
    fullName: body.fullName as string,
    role: body.role,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);

  return mockSuccess(
    { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role, status: newUser.status },
    { message: 'User created successfully', status: 201 }
  );
}
