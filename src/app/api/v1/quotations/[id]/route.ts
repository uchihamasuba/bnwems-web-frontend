import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockQuotations } from '@/mocks/seed';

// UC 2.10 — GET /api/v1/quotations/:id (docs/api/08-quotations.md)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = mockQuotations.find((q) => q.id === id);
  if (!quotation) {
    return mockFailure('Quotation not found', { status: 404 });
  }
  return mockSuccess(quotation);
}

interface QuotationItemInput {
  catalogItemId: string;
  quantity: number;
  price: number;
}

// UC 2.10 — PUT /api/v1/quotations/:id (docs/api/08-quotations.md)
// BR-10-04: không cập nhật được khi status là ACCEPTED hoặc SENT.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = mockQuotations.find((q) => q.id === id);
  if (!quotation) {
    return mockFailure('Quotation not found', { status: 404 });
  }
  if (quotation.status === 'ACCEPTED' || quotation.status === 'SENT') {
    return mockFailure('Quotation cannot be modified after confirmation.', { status: 409, code: 'MSG-UC10-04' });
  }

  const body = await request.json();
  const items = (body.details?.items ?? quotation.details.items) as QuotationItemInput[];

  quotation.subtotal = body.subtotal == null ? quotation.subtotal : Number(body.subtotal);
  quotation.tax = body.tax == null ? quotation.tax : Number(body.tax);
  quotation.discount = body.discount == null ? quotation.discount : Number(body.discount);
  quotation.totalAmount = body.totalAmount == null ? quotation.totalAmount : Number(body.totalAmount);
  quotation.details = { items };
  quotation.updatedAt = new Date().toISOString();

  return mockSuccess(null, { message: 'Quotation updated successfully.' });
}

// UC 2.10 — DELETE /api/v1/quotations/:id (docs/api/08-quotations.md)
// BR-10-05: không xóa được báo giá đã ACCEPTED.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = mockQuotations.findIndex((q) => q.id === id);
  if (index === -1) {
    return mockFailure('Quotation not found', { status: 404 });
  }
  if (mockQuotations[index].status === 'ACCEPTED') {
    return mockFailure('Cannot delete accepted quotations.', { status: 409, code: 'MSG-UC10-04' });
  }

  mockQuotations.splice(index, 1);

  return mockSuccess(null, { message: 'Quotation deleted successfully.' });
}
