import { mockSuccess } from '@/lib/mock-response';
import { mockOrders } from '@/mocks/seed';

// UC 2.8 — GET /api/v1/dashboard/admin (docs/api/13-reports.md)
export async function GET() {
  return mockSuccess({
    activeOrders: mockOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'IN_PROGRESS').length,
    totalRevenueMonth: 25000000,
    unpaidSupplierDebt: 2000000,
    recentOrders: mockOrders.slice(0, 5).map((o) => ({ orderId: o.id, status: o.status })),
  });
}
