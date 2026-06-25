import { mockSuccess } from '@/lib/mock-response';

// UC 2.7 — GET /api/v1/reports/inventory (docs/api/13-reports.md)
export async function GET() {
  return mockSuccess({
    totalDamaged: 10,
    totalLost: 2,
    mostUsedItems: [{ catalogItemId: 'item-1', itemName: 'Loa Bose L1', usageCount: 50 }],
  });
}
