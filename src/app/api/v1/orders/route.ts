import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockOrders, nextId } from '@/mocks/seed';

// UC 2.11 — GET /api/v1/orders (docs/api/09-orders.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const status = params.get('status');

  let result = [...mockOrders];
  if (search) {
    result = result.filter((o) => o.orderNumber.toLowerCase().includes(search));
  }
  if (status) {
    result = result.filter((o) => o.status === status);
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// UC 2.11 — POST /api/v1/orders (docs/api/09-orders.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.customerId || !body.eventDate) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC11-01' });
  }
  if (new Date(body.eventDate).getTime() <= Date.now()) {
    return mockFailure('eventDate must be in the future.', { status: 400, code: 'MSG-UC11-01' });
  }

  const id = nextId('order');
  const now = new Date().toISOString();
  const order = {
    id,
    orderNumber: `ORD-${new Date().getFullYear()}-${id.split('-')[1].padStart(4, '0')}`,
    customerId: body.customerId as string,
    eventDate: body.eventDate as string,
    venueAddress: (body.venueAddress as string) ?? '',
    status: 'DRAFT' as const,
    createdAt: now,
    updatedAt: now,
  };
  mockOrders.push(order);

  return mockSuccess({ id: order.id }, { message: 'Order created successfully.', status: 201 });
}
