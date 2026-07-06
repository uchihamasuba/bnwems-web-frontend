// GET /api/v1/schedules — kế hoạch lịch trình, trả dữ liệu wrap từ WorkTask.
// Controller schedule.controller.ts getSchedules đọc từ taskService.getTasks() rồi map:
//   id          = WorkTask.workTaskId (string)
//   activityType = WorkTask.title (vd 'survey' hoặc tên op tự do)
//   scheduledStart = description JSON.scheduledStart nếu có, hoặc fallback task.createdAt
//   scheduledEnd   = description JSON.scheduledEnd   nếu có, hoặc fallback task.updatedAt
//   location       = description JSON.location        nếu có, hoặc null
// Xem docs/more-require.md mục (bb) để biết chi tiết + lịch sử gap.
export interface Schedule {
  id: string;
  orderId: string;
  activityType: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string | null;
  status: string;
  createdAt: string;
}

export interface GetSchedulesQuery {
  page?: number;
  limit?: number;
  orderId?: string;
  activityType?: string;
  status?: string;
}
