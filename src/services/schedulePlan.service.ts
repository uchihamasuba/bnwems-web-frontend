import api from './api';
import type { Schedule, GetSchedulesQuery } from '@/types/schedulePlan';

interface ScheduleListResponse {
  success: boolean;
  data: Schedule[];
  meta: { page: number; limit: number; totalCount: number };
}

export const schedulePlanApiService = {
  /** GET /api/v1/schedules — lịch kế hoạch kèm scheduledStart/End/location.
   *  Dữ liệu wrap từ WorkTask; scheduledStart/End lấy từ WorkTask.description JSON khi có,
   *  hoặc fallback task.createdAt/updatedAt. Xem docs/more-require.md mục (bb). */
  async getSchedules(params?: GetSchedulesQuery): Promise<ScheduleListResponse> {
    const response = await api.get('/schedules', { params });
    return response.data;
  },
};
