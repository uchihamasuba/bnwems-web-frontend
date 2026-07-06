import type { ChangeRequest, CreateChangeRequestPayload } from '@/types/changeRequest';

export interface GetChangeRequestsQuery {
  orderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ===== MOCK-ONLY =====
// Model ChangeRequest đã bị XÓA HẲN khỏi backend thật (0 kết quả grep "ChangeRequest" trong
// D:\bnwems-backend-api) — không còn route/controller/service/model nào tương ứng. Theo quyết định
// giữ UI + chuyển sang mock rõ ràng (xem docs/more-require.md mục mới nhất), service này gọi
// same-origin route handler mock của chính app (src/app/api/v1/change-requests/*, dữ liệu từ
// src/mocks/seed.ts) thay vì `api` (trỏ backend thật — sẽ 404). XÓA toàn bộ mock này ngay khi
// backend bổ sung lại API cho change-request.
export const changeRequestApiService = {
  async getChangeRequests(params?: GetChangeRequestsQuery) {
    const query = new URLSearchParams();
    if (params?.orderId) query.set('orderId', params.orderId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const response = await fetch(`/api/v1/change-requests?${query.toString()}`);
    return response.json() as Promise<{ success: boolean; data: ChangeRequest[]; meta: { totalCount: number } }>;
  },

  async createChangeRequest(_orderId: string, _payload: CreateChangeRequestPayload) {
    throw new Error('Không có API tạo change-request — mục này chỉ dùng để mobile Leader Staff ghi nhận (ngoài phạm vi web).');
  },

  async approveChangeRequest(id: string, status: 'approved' | 'rejected') {
    const response = await fetch(`/api/v1/change-requests/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};
