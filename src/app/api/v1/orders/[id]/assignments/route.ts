import { mockSuccess } from '@/lib/mock-response';
import { mockOrderAssignments } from '@/mocks/seed';

// MOCK-ONLY — backend thật KHÔNG có GET phân công theo orderId, xem docs/more-require.md mục (n).
// XÓA route handler này (+ mockOrderAssignments trong src/mocks/seed.ts) khi backend bổ sung GET thật.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = mockOrderAssignments.find((a) => a.orderId === id);
  // Chưa có dữ liệu → trả { survey: null, execution: null } để UI hiển thị trạng thái trống.
  return mockSuccess(entry ? { survey: entry.survey, execution: entry.execution } : { survey: null, execution: null });
}
