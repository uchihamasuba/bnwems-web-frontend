import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCustomers, nextId } from '@/mocks/seed';

// UC 2.9 — GET /api/v1/customers (docs/api/07-customers.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();

  let result = [...mockCustomers];
  if (search) {
    result = result.filter(
      (c) =>
        c.fullName.toLowerCase().includes(search) ||
        c.phone.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    );
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit).map((c) => ({
    customerId: c.id,
    fullName: c.fullName,
    phone: c.phone,
    email: c.email,
    address: c.address,
    createdAt: c.createdAt,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// UC 2.9 — POST /api/v1/customers (docs/api/07-customers.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.fullName || !body.phone) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC09-01' });
  }
  if (mockCustomers.some((c) => c.phone === body.phone)) {
    return mockFailure('Customer phone number already exists.', { status: 409, code: 'MSG-UC09-05' });
  }

  const now = new Date().toISOString();
  const customer = {
    id: nextId('customer'),
    fullName: body.fullName as string,
    phone: body.phone as string,
    email: (body.email as string) ?? '',
    address: (body.address as string) ?? '',
    createdAt: now,
    updatedAt: now,
  };
  mockCustomers.push(customer);

  return mockSuccess({ customerId: customer.id }, { message: 'Customer registered successfully.', status: 201 });
}
