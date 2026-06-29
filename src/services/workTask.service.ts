import api from './api';

export interface GetTasksQuery {
  orderId?: string;
  taskType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const workTaskApiService = {
  /** GET /api/v1/tasks (UC 2.14) */
  async getTasks(params?: GetTasksQuery) {
    const response = await api.get('/tasks', { params });
    return response.data;
  },
};
