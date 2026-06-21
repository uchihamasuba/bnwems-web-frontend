import { mockSuccess } from '@/lib/mock-response';

export async function GET() {
  return mockSuccess({
    total_events: 12,
    active_orders: 8,
    monthly_revenue: 250000000,
    pending_requests: 3,
  });
}
