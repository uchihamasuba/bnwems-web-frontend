import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory, nextId } from '@/mocks/seed';

// UC 2.13 — GET /api/v1/inventory (docs/api/05-warehouse-inventory.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const warehouseId = params.get('warehouseId');
  const catalogItemId = params.get('catalogItemId');

  let result = [...mockInventory];
  if (warehouseId) {
    result = result.filter((row) => row.warehouseId === warehouseId);
  }
  if (catalogItemId) {
    result = result.filter((row) => row.catalogItemId === catalogItemId);
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit);

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}

// POST /api/v1/inventory — KHÔNG có trong docs/api/05-warehouse-inventory.md (xem ghi chú
// trong types/inventory.ts). Thêm tạm để hỗ trợ UI "Thêm tồn kho" ở /admin/inventory/stock-status.
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.warehouseId || !body.catalogItemId || body.availableQuantity == null) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }
  if (Number(body.availableQuantity) < 0) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }

  const existing = mockInventory.find(
    (row) => row.warehouseId === body.warehouseId && row.catalogItemId === body.catalogItemId
  );
  if (existing) {
    return mockFailure('System cannot complete the request.', { status: 409, code: 'MSG-UC13-02' });
  }

  const now = new Date().toISOString();
  const newRow = {
    id: nextId('inventory'),
    warehouseId: body.warehouseId as string,
    catalogItemId: body.catalogItemId as string,
    availableQuantity: Number(body.availableQuantity),
    reservedQuantity: 0,
    checkedOutQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    updatedAt: now,
  };
  mockInventory.push(newRow);

  return mockSuccess(newRow, { message: 'Tạo bản ghi tồn kho thành công.', status: 201 });
}
