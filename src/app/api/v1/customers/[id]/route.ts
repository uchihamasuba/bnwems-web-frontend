import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCustomers } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = mockCustomers.find((c) => c.id === Number(id));
  if (!customer) {
    return mockFailure('Không tìm thấy khách hàng', { status: 404 });
  }
  return mockSuccess(customer);
}
