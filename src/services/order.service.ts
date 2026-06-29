import api from './api';
import type { CreateOrderPayload } from '@/types/order';

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
};
