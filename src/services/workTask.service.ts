import api from './api';

export interface GetTasksQuery {
  orderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ⚠️ Xác nhận bằng cách đọc trực tiếp D:\bnwems-backend-api\src\services\task.service.ts —
// createTask ghi `title: taskType`, `taskCategory: taskType === 'survey' ? 'survey' : 'operation'`.
// Nghĩa là field `taskType` gửi lên vừa quyết định phân loại (chỉ đặc cách đúng chuỗi 'survey'),
// vừa trở thành `title` hiển thị nguyên văn — nếu muốn tiêu đề đẹp cho task khảo sát thì không thể
// (title sẽ luôn là chữ "survey"). `scheduledStart/scheduledEnd/location` được ghi dồn vào cột
// `description` dạng JSON.stringify (không có cột riêng, không đọc lại được qua GET /tasks vì
// getTasks không parse description) — không dùng để hiển thị lịch, chỉ gửi lên vì validator bắt
// buộc. Xem docs/more-require.md mục (bb).
export interface CreateTaskPayload {
  taskType: string;
  scheduledStart: string;
  scheduledEnd: string;
  location?: string;
}

export interface UpdateTaskPayload {
  scheduledStart?: string;
  scheduledEnd?: string;
  location?: string;
}

export interface UpdateTaskProgressPayload {
  status: 'assigned' | 'in_progress' | 'done';
  progressPercent?: number;
  notes?: string;
}

export const workTaskApiService = {
  // ⚠️ Không truyền `taskType` khi GET — backend thật (task.service.ts getTasks) lọc
  // `whereClause.title = taskType` (so khớp field `title` tự do, không phải cột phân loại
  // `taskCategory`), nên filter theo loại luôn trả rỗng/sai. Lọc `taskCategory` phía client sau khi
  // nhận kết quả. Xem docs/more-require.md mục (bb).
  /** GET /api/v1/tasks (UC 2.14) */
  async getTasks(params?: GetTasksQuery) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  /** POST /api/v1/orders/:orderId/tasks (UC 2.15.1) — chỉ có route lồng theo order, không có POST /tasks rời. */
  async createTask(orderId: string, payload: CreateTaskPayload) {
    const response = await api.post(`/orders/${orderId}/tasks`, payload);
    return response.data as { success: boolean; message: string; data: { id: string } };
  },

  /** PUT /api/v1/tasks/:id (UC 2.15.3) — chỉ áp dụng khi task đang ở trạng thái draft. */
  async updateTask(taskId: string, payload: UpdateTaskPayload) {
    const response = await api.put(`/tasks/${taskId}`, payload);
    return response.data;
  },

  /** PATCH /api/v1/tasks/:id/status (UC 2.15.4) — chỉ xóa/hủy được khi task đang draft. */
  async cancelTask(taskId: string, status: 'cancelled' | 'deleted' = 'cancelled') {
    const response = await api.patch(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  /** PUT /api/v1/tasks/:id/progress — chuyển trạng thái draft → assigned/in_progress/done + % tiến độ. */
  async updateTaskProgress(taskId: string, payload: UpdateTaskProgressPayload) {
    const response = await api.put(`/tasks/${taskId}/progress`, payload);
    return response.data;
  },
};
