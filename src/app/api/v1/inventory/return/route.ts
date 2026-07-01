import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory, mockWarehouseHistories, nextWarehouseHistoryId } from '@/mocks/seed';

// UC 2.23 — POST /api/v1/inventory/return (docs/api/05-warehouse-inventory.md)
// BR-23-03: decreases checkedOutQuantity, increases availableQuantity.
// BR-23-04: if condition is DAMAGED, increases damagedQuantity instead.
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.warehouseId || !body.orderId || !Array.isArray(body.items) || body.items.length === 0) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }

  const items = body.items as { catalogItemId: string; quantity: number; condition: 'GOOD' | 'DAMAGED' }[];

  for (const requested of items) {
    const row = mockInventory.find(
      (r) => r.warehouseId === body.warehouseId && r.catalogItemId === requested.catalogItemId
    );
    if (!row || row.checkedOutQuantity < requested.quantity) {
      return mockFailure('Items must be returned before confirming warehouse return.', {
        status: 409,
        code: 'MSG-UC23-02',
      });
    }
  }

  for (const requested of items) {
    const row = mockInventory.find(
      (r) => r.warehouseId === body.warehouseId && r.catalogItemId === requested.catalogItemId
    )!;
    row.checkedOutQuantity -= requested.quantity;
    if (requested.condition === 'DAMAGED') {
      row.damagedQuantity += requested.quantity;
    } else {
      row.availableQuantity += requested.quantity;
    }
    row.updatedAt = new Date().toISOString();
  }

  mockWarehouseHistories.push({
    id: nextWarehouseHistoryId(),
    warehouseId: body.warehouseId,
    transactionType: 'RETURN',
    performedBy: 'usr-1',
    createdAt: new Date().toISOString(),
  });

  return mockSuccess(null, { message: 'Items returned to warehouse.' });
}
