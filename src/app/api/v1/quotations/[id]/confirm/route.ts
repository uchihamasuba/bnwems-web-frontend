import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockOrders, mockQuotations } from '@/mocks/seed';

// UC 2.10 — PUT /api/v1/quotations/:id/confirm (docs/api/08-quotations.md)
// BR-10-06: chuyển status quotation sang ACCEPTED.
// BR-10-07: tự động cập nhật status của Order cha sang QUOTED.
export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = mockQuotations.find((q) => q.id === id);
  if (!quotation) {
    return mockFailure('Quotation not found', { status: 404 });
  }

  quotation.status = 'ACCEPTED';
  quotation.updatedAt = new Date().toISOString();

  const order = mockOrders.find((o) => o.id === quotation.orderId);
  if (order) {
    order.status = 'QUOTED';
    order.updatedAt = new Date().toISOString();
  }

  return mockSuccess({ status: quotation.status }, { message: 'Quotation confirmed.' });
}
