import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockCustomers, nextId } from '@/mocks/seed';

export async function GET() {
  return mockSuccess(mockCustomers, {
    meta: { page: 1, limit: 20, total: mockCustomers.length, total_pages: 1 },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const customer = {
    id: nextId('customer'),
    full_name: body.full_name,
    phone: body.phone,
    email: body.email ?? null,
    address: body.address ?? null,
    notes: body.notes ?? null,
    status: 'active',
  };
  mockCustomers.push(customer as (typeof mockCustomers)[number]);
  return mockSuccess(customer, { code: 'MSG-CUS-01', message: 'Tạo khách hàng thành công', status: 201 });
}
