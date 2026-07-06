import api from './api';
import type { CancelOrderPayload, ChangeOrderDatePayload, CreateOrderPayload, UpdateOrderPayload } from '@/types/order';

export interface GetOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export const orderApiService = {
  /** GET /api/v1/orders (UC 2.11) */
  async getOrders(params?: GetOrdersQuery) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  /** GET /api/v1/orders/{id} (UC 2.11) */
  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /** POST /api/v1/orders (UC 2.11) */
  async createOrder(payload: CreateOrderPayload) {
    const response = await api.post('/orders', payload);
    return response.data;
  },

  /**
   * PUT /api/v1/orders/{id}/cancel — endpoint suy theo convention confirm/change-date/close,
   * CHƯA có ở backend thật (docs/more-require.md mục y). Sẽ trả 404 cho tới khi backend bổ sung.
   */
  async cancelOrder(id: string, payload: CancelOrderPayload) {
    const response = await api.put(`/orders/${id}/cancel`, payload);
    return response.data;
  },

  /**
   * PUT /api/v1/orders/{id} — endpoint suy theo REST convention chung, CHƯA có ở backend thật
   * (docs/more-require.md mục z). Sẽ trả 404 cho tới khi backend bổ sung.
   */
  async updateOrder(id: string, payload: UpdateOrderPayload) {
    const response = await api.put(`/orders/${id}`, payload);
    return response.data;
  },

  /** PUT /api/v1/orders/{id}/change-date (UC 2.11) */
  async changeOrderDate(id: string, payload: ChangeOrderDatePayload) {
    const response = await api.put(`/orders/${id}/change-date`, payload);
    return response.data;
  },
};
