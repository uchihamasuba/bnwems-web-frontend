import api from './api';
import type { RequestPaymentPayload, ConfirmPaymentPayload } from '@/types/payment';

export const paymentApiService = {
  /** GET /api/v1/orders/{orderId}/payments (UC 2.19) */
  async getPaymentsByOrder(orderId: string) {
    const response = await api.get(`/orders/${orderId}/payments`);
    return response.data;
  },

  /** POST /api/v1/orders/{orderId}/payments/request (UC 2.19) */
  async requestPayment(orderId: string, payload: RequestPaymentPayload) {
    const response = await api.post(`/orders/${orderId}/payments/request`, payload);
    return response.data;
  },

  /**
   * PUT /api/v1/payments/{paymentRequestId}/confirm (UC 2.19).
   * Tham số là paymentRequestId (id trả về từ requestPayment), KHÔNG phải paymentId trong các
   * dòng trả về bởi getPaymentsByOrder — xem types/payment.ts.
   */
  async confirmPaymentRequest(paymentRequestId: string, payload: ConfirmPaymentPayload) {
    const response = await api.put(`/payments/${paymentRequestId}/confirm`, payload);
    return response.data;
  },
};
