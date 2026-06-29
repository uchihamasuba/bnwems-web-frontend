import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockCustomers, mockOrders } from '@/mocks/seed';

// UC 2.11 — GET /api/v1/orders/:id (docs/api/09-orders.md)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = mockOrders.find((o) => o.id === id);
  if (!order) {
    return mockFailure('Order not found', { status: 404 });
  }
  const customer = mockCustomers.find((c) => c.id === order.customerId);

  return mockSuccess({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    eventStartDate: order.eventDate,
    venueAddress: order.venueAddress,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: customer ? { fullName: customer.fullName, phone: customer.phone } : null,
  });
}
