import { mockSuccess } from '@/lib/mock-response';

// UC 2.8 — GET /api/v1/dashboard/manager (docs/api/13-reports.md)
export async function GET() {
  return mockSuccess({
    ordersInProgress: 5,
    pendingChangeRequests: 2,
    tasksToday: 8,
    alerts: [],
  });
}
