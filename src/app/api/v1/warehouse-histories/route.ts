import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockWarehouseHistories } from '@/mocks/seed';

// UC 2.23 — GET /api/v1/warehouse-histories (docs/api/05-warehouse-inventory.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const transactionType = params.get('transactionType');

  let result = [...mockWarehouseHistories];
  if (transactionType) {
    result = result.filter((row) => row.transactionType === transactionType);
  }
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}
