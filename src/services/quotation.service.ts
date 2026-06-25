import api from './api';
import type { SaveQuotationPayload } from '@/types/quotation';

export const quotationApiService = {
  /** GET /api/v1/orders/{orderId}/quotations (UC 2.10) */
  async getOrderQuotations(orderId: string, params?: { page?: number; limit?: number }) {
    const response = await api.get(`/orders/${orderId}/quotations`, { params });
    return response.data;
  },

  /** GET /api/v1/quotations/{id} (UC 2.10) */
  async getQuotation(id: string) {
    const response = await api.get(`/quotations/${id}`);
    return response.data;
  },

  /** POST /api/v1/orders/{orderId}/quotations (UC 2.10) */
  async createQuotation(orderId: string, payload: SaveQuotationPayload) {
    const response = await api.post(`/orders/${orderId}/quotations`, payload);
    return response.data;
  },

  /** PUT /api/v1/quotations/{id} (UC 2.10) */
  async updateQuotation(id: string, payload: SaveQuotationPayload) {
    const response = await api.put(`/quotations/${id}`, payload);
    return response.data;
  },

  /** DELETE /api/v1/quotations/{id} (UC 2.10) */
  async deleteQuotation(id: string) {
    const response = await api.delete(`/quotations/${id}`);
    return response.data;
  },

  /** PUT /api/v1/quotations/{id}/confirm (UC 2.10) */
  async confirmQuotation(id: string) {
    const response = await api.put(`/quotations/${id}/confirm`);
    return response.data;
  },
};
