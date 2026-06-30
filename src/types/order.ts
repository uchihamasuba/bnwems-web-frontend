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
  eventType?: string;    // (*) chưa có cột trong DB → mock từ orderId (mục u)
  eventDate: string;
  eventEndDate?: string; // (*) chưa có cột trong DB → mock: eventDate+1 ngày (mục s)
  venueName?: string;    // (*) chưa có cột riêng → mock: split eventLocation (mục v)
  eventLocation: string;
  guestCount?: number;   // (*) chưa có cột trong DB → mock: deterministic (mục w)
  status: OrderStatus;
  createdAt: string;
}

// GET /api/v1/orders/:id
export interface OrderDetail extends Order {
  customer: { fullName: string; phone: string } | null;
  updatedAt: string;
}

// POST /api/v1/orders
// eventEndDate: backend thật CHƯA có cột lưu field này (xem docs/more-require.md mục (s)) — gửi
// kèm tạm thời không gây lỗi (controller chỉ destructure customerId/eventDate/venueAddress nên
// field thừa bị bỏ qua), nhưng dữ liệu sẽ KHÔNG được lưu lại cho tới khi backend thêm cột.
export interface CreateOrderPayload {
  customerId: string;
  eventDate: string;
  venueAddress: string;
  eventEndDate?: string;
}
