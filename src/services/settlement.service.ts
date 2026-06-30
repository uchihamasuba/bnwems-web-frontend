import api from './api';
import type { RecordSettlementPayload, ConfirmSettlementPayload, SettlementPreviewMock } from '@/types/settlement';

export const settlementApiService = {
  /** POST /api/v1/orders/{orderId}/settlement (UC 2.30) */
  async recordSettlement(orderId: string, payload: RecordSettlementPayload) {
    const response = await api.post(`/orders/${orderId}/settlement`, payload);
    return response.data;
  },

  /** PUT /api/v1/settlements/{settlementId}/confirm (UC 2.19) */
  async confirmSettlement(settlementId: string, payload: ConfirmSettlementPayload) {
    const response = await api.put(`/settlements/${settlementId}/confirm`, payload);
    return response.data;
  },

  /**
   * MOCK-ONLY. Backend thật không có GET cho Settlement theo orderId (xem docs/more-require.md
   * mục a) nên không thể gọi qua `api` (trỏ NEXT_PUBLIC_API_BASE_URL — backend thật, không có
   * route này). Gọi same-origin trực tiếp tới route handler mock của chính app này
   * (src/app/api/v1/orders/[id]/settlement-preview/route.ts). XÓA hàm này + route handler tương
   * ứng ngay khi backend bổ sung GET thật.
   */
  async getSettlementPreviewMock(orderId: string) {
    const response = await fetch(`/api/v1/orders/${orderId}/settlement-preview`);
    return response.json() as Promise<{ success: boolean; data: SettlementPreviewMock | null }>;
  },
};
