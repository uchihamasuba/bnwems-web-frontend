import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockChangeRequests } from '@/mocks/seed';

// UC 2.27 — GET /api/v1/change-requests (docs/api/09-orders.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const orderId = params.get('orderId');
  const status = params.get('status');

  let result = [...mockChangeRequests];
  if (orderId) {
    result = result.filter((cr) => cr.orderId === orderId);
  }
  if (status) {
    result = result.filter((cr) => cr.status === status);
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit).map((cr) => ({
    changeRequestId: cr.id,
    orderId: cr.orderId,
    type: cr.type,
    items: cr.items,
    status: cr.status,
    createdAt: cr.createdAt,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}
