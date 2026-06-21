import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockQuotations, nextId } from '@/mocks/seed';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotations = mockQuotations.filter((q) => q.order_id === Number(id));
  return mockSuccess(quotations);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const lines = (body.lines ?? []) as Array<{ catalog_item_id: number; quantity: number; unit_price: number }>;
  const total_amount = lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
  const discount_amount = body.discount_amount ?? 0;

  const quotation = {
    id: nextId('quotation'),
    order_id: Number(id),
    version: 1,
    total_amount,
    discount_amount,
    final_amount: total_amount - discount_amount,
    notes: body.notes ?? null,
    status: 'draft',
    created_by: { id: 5, full_name: 'Nguyễn Văn A' },
    created_at: new Date().toISOString(),
    lines,
  };
  mockQuotations.push(quotation as (typeof mockQuotations)[number]);

  return mockSuccess(
    {
      id: quotation.id,
      order_id: quotation.order_id,
      version: quotation.version,
      total_amount: quotation.total_amount,
      discount_amount: quotation.discount_amount,
      final_amount: quotation.final_amount,
      status: quotation.status,
    },
    { code: 'MSG-QT-01', message: 'Tạo báo giá thành công', status: 201 }
  );
}
