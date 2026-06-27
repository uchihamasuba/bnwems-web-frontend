import api from './api';
import type { CreateChangeRequestPayload } from '@/types/changeRequest';

export interface GetChangeRequestsQuery {
  orderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const changeRequestApiService = {
  /** GET /api/v1/change-requests (UC 2.27) */
  async getChangeRequests(params?: GetChangeRequestsQuery) {
    const response = await api.get('/change-requests', { params });
    return response.data;
  },

  /** POST /api/v1/orders/:orderId/change-requests (UC 2.27) */
  async createChangeRequest(orderId: string, payload: CreateChangeRequestPayload) {
    const response = await api.post(`/orders/${orderId}/change-requests`, payload);
    return response.data;
  },

  /** PUT /api/v1/change-requests/:id/approve (UC 2.27) */
  async approveChangeRequest(id: string, status: 'approved' | 'rejected') {
    const response = await api.put(`/change-requests/${id}/approve`, { status });
    return response.data;
  },
};
