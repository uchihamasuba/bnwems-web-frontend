import { mockSuccess } from '@/lib/mock-response';
import { mockChangeRequests, mockWorkTasks } from '@/mocks/seed';

// UC 2.8 — GET /api/v1/dashboard/manager (docs/api/13-reports.md)
export async function GET() {
  return mockSuccess({
    ordersInProgress: 5,
    pendingChangeRequests: mockChangeRequests.filter((cr) => cr.status === 'pending').length,
    tasksToday: mockWorkTasks.length,
    alerts: [{ type: 'delayed_task', workTaskId: 'task-2' }],
  });
}
