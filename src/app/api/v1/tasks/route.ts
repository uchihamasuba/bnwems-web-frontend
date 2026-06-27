import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockWorkTasks } from '@/mocks/seed';

// UC 2.14 — GET /api/v1/tasks (docs/api/10-survey-assignment.md)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Number(params.get('page') ?? '1');
  const limit = Number(params.get('limit') ?? '20');
  const orderId = params.get('orderId');
  const taskType = params.get('taskType');
  const status = params.get('status');

  let result = [...mockWorkTasks];
  if (orderId) {
    result = result.filter((t) => t.orderId === orderId);
  }
  if (taskType) {
    result = result.filter((t) => t.taskType === taskType);
  }
  if (status) {
    result = result.filter((t) => t.status === status);
  }

  const totalCount = result.length;
  const start = (page - 1) * limit;
  const paged = result.slice(start, start + limit).map((t) => ({
    workTaskId: t.id,
    orderId: t.orderId,
    taskType: t.taskType,
    scheduledStart: t.scheduledStart,
    scheduledEnd: t.scheduledEnd,
    status: t.status,
  }));

  return mockSuccess(paged, { meta: { page, limit, totalCount } });
}
