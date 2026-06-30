import api from './api';
import type { AssignStaffPayload, OrderAssignments } from '@/types/assignment';

export const assignmentApiService = {
  // MOCK-ONLY — backend thật KHÔNG có GET phân công theo order/task (xem docs/more-require.md mục n).
  // Dùng relative fetch để luôn trúng Next.js mock route (giống settlement.service.getSettlementPreviewMock),
  // bất kể NEXT_PUBLIC_API_BASE_URL trỏ backend thật hay mock nội bộ.
  // XÓA khi backend bổ sung GET thật.
  async getOrderAssignments(orderId: string) {
    const response = await fetch(`/api/v1/orders/${orderId}/assignments`);
    return response.json() as Promise<{ success: boolean; data: OrderAssignments | null }>;
  },

  /** POST /api/v1/tasks/:id/assignments (UC 2.15.2) */
  async assignStaff(taskId: string, payload: AssignStaffPayload) {
    const response = await api.post(`/tasks/${taskId}/assignments`, payload);
    return response.data;
  },
};
