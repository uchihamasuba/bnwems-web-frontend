import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory } from '@/mocks/seed';

// UC 2.13 — POST /api/v1/inventory/reserve (docs/api/05-warehouse-inventory.md)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.orderId || !Array.isArray(body.items) || body.items.length === 0) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }

  for (const requested of body.items as { catalogItemId: string; quantity: number }[]) {
    const totalAvailable = mockInventory
      .filter((row) => row.catalogItemId === requested.catalogItemId)
      .reduce((sum, row) => sum + row.availableQuantity, 0);

    if (totalAvailable < requested.quantity) {
      return mockFailure('Insufficient inventory available for the requested date.', {
        status: 409,
        code: 'MSG-UC13-04',
      });
    }
  }

  for (const requested of body.items as { catalogItemId: string; quantity: number }[]) {
    let remaining = requested.quantity;
    for (const row of mockInventory) {
      if (remaining <= 0) break;
      if (row.catalogItemId !== requested.catalogItemId) continue;

      const take = Math.min(row.availableQuantity, remaining);
      row.availableQuantity -= take;
      row.reservedQuantity += take;
      row.updatedAt = new Date().toISOString();
      remaining -= take;
    }
  }

  return mockSuccess(null, { message: 'Inventory successfully reserved.' });
}
