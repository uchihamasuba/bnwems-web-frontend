import { mockSuccess } from '@/lib/mock-response';

// Số liệu giả định cho UC26 (Administrative Dashboard) — docs/api chưa chốt field cho endpoint này.
export async function GET() {
  return mockSuccess({
    total_orders: 53,
    total_revenue: 1850000000,
    pending_audit_count: 4,
    low_stock_alerts: 2,
  });
}
