import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockChangeRequests } from '@/mocks/seed';

// UC 2.27 — PUT /api/v1/change-requests/:id/approve (docs/api/09-orders.md)
// BR-27-01: phê duyệt sẽ cập nhật tổng tài chính của Order — mock hiện chỉ đổi status,
// chưa tính/cộng phụ phí vào settlement (cần đồng bộ khi có backend thật).
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changeRequest = mockChangeRequests.find((cr) => cr.id === id);
  if (!changeRequest) {
    return mockFailure('Change request not found', { status: 404 });
  }

  const body = await request.json();
  if (body.status !== 'approved' && body.status !== 'rejected') {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC27-01' });
  }

  changeRequest.status = body.status;

  return mockSuccess({ status: changeRequest.status }, { message: 'Change request status updated.' });
}
