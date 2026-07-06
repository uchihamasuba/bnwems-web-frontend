// UC 2.11 (docs/api/09-orders.md)
// Lưu ý: backend thật (D:\bnwems-backend-api, prisma/schema.prisma model Order) lệch với doc:
// - Không có cột orderNumber — backend chưa sinh mã đơn hàng nào, BR-11-01 chưa được code.
// - Field đọc thật là eventDate/eventLocation (không phải eventStartDate/venueAddress như doc).
// - Request body POST /orders thật nhận eventDate (không phải eventStartDate như doc/CreateOrderPayload
//   cũ) — xem src/validators/order.validator.ts + controllers/order.controller.ts của backend.
// - status thật là 5 giá trị lowercase: draft, confirmed, in_progress, completed, cancelled
//   (không có "quoted" như doc, có thêm "cancelled" mà doc không nhắc).
// - Ngoài 5 giá trị trên, runtime còn ghi thêm deposit_paid và settlement_pending (xem
//   more-require.md mục h) — chưa được khai báo trong schema/doc nhưng xuất hiện thực tế.
export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'deposit_paid'        // runtime: payment.service.ts confirmPayment khi paymentType=deposit
  | 'settlement_pending'; // runtime: settlement.service.ts confirmSettlement

// GET /api/v1/orders
// Các field optional (*) chưa có trong backend — frontend mock khi undefined.
// Xem docs/more-require.md để biết đề xuất backend cần implement.
export interface Order {
  orderId: string;
  orderNumber?: string;  // (*) BR-11-01 chưa implement → mock: ORD-{year}-{id} (mục t)
  customerId: string;
  eventType?: string;    // field thật (mục u đã triển khai) — undefined ở các order tạo trước đó
  eventDate: string;
  eventEndDate?: string; // field thật (mục s đã triển khai) — undefined nếu để trống lúc tạo
  venueName?: string;    // (*) chưa có cột riêng → mock: split eventLocation (mục v)
  eventLocation: string;
  guestCount?: number;   // field thật (mục w đã triển khai) — undefined nếu để trống lúc tạo
  status: OrderStatus;
  createdAt: string;
}

// GET /api/v1/orders/:id
export interface OrderDetail extends Order {
  customer: { fullName: string; phone: string } | null;
  updatedAt: string;
}

// POST /api/v1/orders
// customerId/eventDate bắt buộc; venueAddress optional theo createOrderSchema thật nhưng vẫn bắt
// buộc ở FE (quy tắc nghiệp vụ: 1 đơn hàng sự kiện cần địa điểm). eventEndDate/eventType/guestCount
// đã được backend lưu thật (mục s/u/w docs/more-require.md) — không còn là field bị bỏ qua.
export interface CreateOrderPayload {
  customerId: string;
  eventDate: string;
  venueAddress: string;
  eventEndDate?: string;
  eventType?: string;
  guestCount?: number;
}

// PUT /api/v1/orders/:id/cancel — endpoint CHƯA tồn tại ở backend thật (order.route.ts chỉ có
// confirm/change-date/close), suy ra theo đúng convention của 3 endpoint lifecycle đó. Xem
// docs/more-require.md mục (y) — sẽ 404 cho tới khi backend bổ sung route + service tương ứng.
export interface CancelOrderPayload {
  reason: string;
}

// PUT /api/v1/orders/:id — endpoint CHƯA tồn tại ở backend thật (order.route.ts chỉ có
// confirm/change-date/close), suy theo REST convention chung (khác cancelOrder — suy được vì đúng
// convention URL của 3 lifecycle endpoint có sẵn). Xem docs/more-require.md mục (z) — sẽ 404 cho
// tới khi backend bổ sung route + validator + controller + service tương ứng.
export interface UpdateOrderPayload {
  eventType?: string;
  eventEndDate?: string;
  venueAddress?: string;
  guestCount?: number;
}

// PUT /api/v1/orders/:id/change-date — endpoint có thật. Field thật là `newEventDate`
// (docs/api/09-orders.md ghi nhầm `newEventStartDate` — xem docs/more-require.md mục (z)).
export interface ChangeOrderDatePayload {
  newEventDate: string;
}
