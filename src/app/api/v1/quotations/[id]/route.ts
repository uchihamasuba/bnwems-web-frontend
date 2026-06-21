import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockQuotations } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = mockQuotations.find((q) => q.id === Number(id));
  if (!quotation) {
    return mockFailure('Không tìm thấy báo giá', { status: 404 });
  }
  return mockSuccess(quotation);
}
