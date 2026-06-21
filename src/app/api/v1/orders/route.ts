import { NextRequest } from 'next/server';
import { mockSuccess } from '@/lib/mock-response';
import { mockCustomers, mockOrders, nextId } from '@/mocks/seed';

export async function GET() {
  return mockSuccess(mockOrders, {
    meta: { page: 1, limit: 20, total: mockOrders.length, total_pages: 1 },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const customer = mockCustomers.find((c) => c.id === body.customer_id);
  const id = nextId('order');
  const order = {
    id,
    code: `ORD-${String(id).padStart(3, '0')}`,
    customer_id: body.customer_id,
    customer: customer ? { id: customer.id, full_name: customer.full_name } : null,
    event_type: body.event_type,
    event_date: body.event_date,
    event_end_date: body.event_end_date ?? body.event_date,
    venue_name: body.venue_name,
    venue_address: body.venue_address,
    guest_count: body.guest_count ?? null,
    notes: body.notes ?? null,
    status: 'new',
  };
  mockOrders.push(order as (typeof mockOrders)[number]);
  return mockSuccess(
    { id: order.id, code: order.code, status: order.status },
    { code: 'MSG-CO-01', message: 'Tạo đơn hàng thành công', status: 201 }
  );
}
