// UC 2.11 (docs/api/09-orders.md)
// status đổi từ UPPERCASE (DRAFT/QUOTED/CONFIRMED/IN_PROGRESS/COMPLETED) sang lowercase, bỏ
// 'quoted', thêm 'deposit_paid'/'settlement_pending'/'cancelled'. Thêm field eventEndDate/
// eventType/guestCount trên Order.

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'deposit_paid'
  | 'in_progress'
  | 'settlement_pending'
  | 'completed'
  | 'cancelled';

// GET /api/v1/orders
export interface Order {
  orderId: string;
  orderNumber: string;
  customerId: string;
  eventStartDate: string;
  eventEndDate: string;
  eventType: string;
  guestCount: number;
  venueAddress: string;
  status: OrderStatus;
  createdAt: string;
}

// GET /api/v1/orders/:id
export interface OrderDetail extends Order {
  customer: { fullName: string; phone: string } | null;
  updatedAt: string;
}

// POST /api/v1/orders
export interface CreateOrderPayload {
  customerId: string;
  eventStartDate: string;
  eventEndDate: string;
  eventType: string;
  guestCount: number;
  venueAddress: string;
}
