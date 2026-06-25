import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory, mockWarehouseHistories, nextWarehouseHistoryId } from '@/mocks/seed';

// UC 2.23 — POST /api/v1/warehouse/checkout (docs/api/05-warehouse-inventory.md)
// BR-23-01: items checked out must match the confirmed order/pick-list (reserved quantity here).
// BR-23-02: decreases reservedQuantity, increases checkedOutQuantity.
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.warehouseId || !body.orderId || !Array.isArray(body.items) || body.items.length === 0) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }

  const items = body.items as { catalogItemId: string; quantity: number }[];

  for (const requested of items) {
    const row = mockInventory.find(
      (r) => r.warehouseId === body.warehouseId && r.catalogItemId === requested.catalogItemId
    );
    if (!row || row.reservedQuantity < requested.quantity) {
      return mockFailure('Scanned items do not match the assigned pick-list.', { status: 409, code: 'MSG-UC23-01' });
    }
  }

  for (const requested of items) {
    const row = mockInventory.find(
      (r) => r.warehouseId === body.warehouseId && r.catalogItemId === requested.catalogItemId
    )!;
    row.reservedQuantity -= requested.quantity;
    row.checkedOutQuantity += requested.quantity;
    row.updatedAt = new Date().toISOString();
  }

  mockWarehouseHistories.push({
    id: nextWarehouseHistoryId(),
    warehouseId: body.warehouseId,
    transactionType: 'CHECKOUT',
    performedBy: 'usr-1',
    createdAt: new Date().toISOString(),
  });

  return mockSuccess(null, { message: 'Items checked out successfully.' });
}
