import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockOrders } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === Number(id));
  if (!order) {
    return mockFailure('Không tìm thấy đơn hàng', { status: 404 });
  }
  return mockSuccess(order);
}
