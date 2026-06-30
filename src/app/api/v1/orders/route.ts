import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockOrders, nextId } from '@/mocks/seed';

// UC 2.11 — GET /api/v1/orders (docs/api/09-orders.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const status = params.get('status');

  let result = [...mockOrders];
  if (status) {
    result = result.filter((o) => o.status === status);
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit).map((o) => ({
    orderId: o.id,
    customerId: o.customerId,
    eventDate: o.eventDate,
    eventLocation: o.eventLocation,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// UC 2.11 — POST /api/v1/orders (docs/api/09-orders.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.customerId || !body.eventStartDate) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC11-01' });
  }
  if (new Date(body.eventStartDate).getTime() <= Date.now()) {
    return mockFailure('eventStartDate must be in the future.', { status: 400, code: 'MSG-UC11-01' });
  }

  const id = nextId('order');
  const now = new Date().toISOString();
  const order = {
    id,
    customerId: body.customerId as string,
    eventDate: body.eventStartDate as string,
    eventLocation: (body.venueAddress as string) ?? '',
    status: 'draft' as const,
    createdAt: now,
    updatedAt: now,
  };
  mockOrders.push(order);

  return mockSuccess({ orderId: order.id }, { message: 'Order created successfully.', status: 201 });
}
