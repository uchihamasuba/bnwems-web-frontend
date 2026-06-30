import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockQuotations } from '@/mocks/seed';

// UC 2.10 — PUT /api/v1/quotations/:id/confirm (docs/api/08-quotations.md)
// BR-10-06: chuyển status quotation sang ACCEPTED.
// Order cha KHÔNG tự chuyển status ở bước này — backend thật chỉ chuyển Order sang "confirmed"
// ở PUT /orders/:id/confirm riêng (và yêu cầu Quotation.status đã "confirmed" trước đó).
export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = mockQuotations.find((q) => q.id === id);
  if (!quotation) {
    return mockFailure('Quotation not found', { status: 404 });
  }

  quotation.status = 'ACCEPTED';
  quotation.updatedAt = new Date().toISOString();

  return mockSuccess({ status: quotation.status }, { message: 'Quotation confirmed.' });
}
