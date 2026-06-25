import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockInventory } from '@/mocks/seed';

// UC 2.13 — GET /api/v1/inventory/availability (docs/api/05-warehouse-inventory.md)
// BR-13-01: Available = Total - (Reserved + CheckedOut + Damaged + Lost).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const eventDate = params.get('eventDate');
  const itemId = params.get('itemId');

  if (!eventDate || !itemId) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC13-01' });
  }

  const availableQuantityOnDate = mockInventory
    .filter((row) => row.catalogItemId === itemId)
    .reduce((sum, row) => sum + row.availableQuantity, 0);

  return mockSuccess({
    catalogItemId: itemId,
    isAvailable: availableQuantityOnDate > 0,
    availableQuantityOnDate,
  });
}
