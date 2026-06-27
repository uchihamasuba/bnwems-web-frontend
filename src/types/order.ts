// UC 2.11 (docs/api/09-orders.md)

export type OrderStatus = 'DRAFT' | 'QUOTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';

// GET /api/v1/orders
export interface Order {
  orderId: string;
  orderNumber: string;
  customerId: string;
  eventStartDate: string;
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
  venueAddress: string;
}
