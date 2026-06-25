import { NextRequest } from 'next/server';
import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockQuotations, nextId } from '@/mocks/seed';

function toQuotationSummary(quotation: (typeof mockQuotations)[number]) {
  return {
    id: quotation.id,
    orderId: quotation.orderId,
    version: quotation.version,
    subtotal: quotation.subtotal,
    tax: quotation.tax,
    discount: quotation.discount,
    totalAmount: quotation.totalAmount,
    status: quotation.status,
    createdAt: quotation.createdAt,
  };
}

// UC 2.10 — GET /api/v1/orders/:orderId/quotations (docs/api/08-quotations.md)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? '20');

  const all = mockQuotations.filter((q) => q.orderId === id);
  const totalCount = all.length;
  const start = (page - 1) * limit;
  const paged = all.slice(start, start + limit);

  return mockSuccess(paged.map((q) => toQuotationSummary(q)), { meta: { page, limit, totalCount } });
}

interface QuotationItemInput {
  catalogItemId: string;
  quantity: number;
  price: number;
}

// UC 2.10 — POST /api/v1/orders/:orderId/quotations (docs/api/08-quotations.md)
// BR-10-01: version tự tăng theo các báo giá hiện có của order.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const items = (body.details?.items ?? []) as QuotationItemInput[];

  if (body.subtotal == null || body.totalAmount == null || items.length === 0) {
    return mockFailure('Required information is missing or invalid.', { status: 400, code: 'MSG-UC10-01' });
  }

  const existingVersions = mockQuotations.filter((q) => q.orderId === id).map((q) => q.version);
  const version = existingVersions.length > 0 ? Math.max(...existingVersions) + 1 : 1;

  const now = new Date().toISOString();
  const quotation = {
    id: nextId('quotation'),
    orderId: id,
    version,
    subtotal: Number(body.subtotal),
    tax: Number(body.tax ?? 0),
    discount: Number(body.discount ?? 0),
    totalAmount: Number(body.totalAmount),
    details: { items },
    status: 'DRAFT' as const,
    createdAt: now,
    updatedAt: now,
  };
  mockQuotations.push(quotation);

  return mockSuccess({ id: quotation.id, version: quotation.version }, { message: 'Quotation created.', status: 201 });
}
