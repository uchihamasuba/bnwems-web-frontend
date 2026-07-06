// docs/api/08-quotations.md — ĐÃ LỖI THỜI sau đợt backend refactor 2026-07-06. Kiến trúc đổi hẳn:
// Quotation giờ thuộc CUSTOMER (không thuộc Order). Order chỉ có `quotationId` FK optional, tham
// chiếu 1 quotation có sẵn để lưu vết — KHÔNG tự copy items từ quotation sang order.
// Nguồn: D:\bnwems-backend-api prisma/schema.prisma (model Quotation/QuotationItem),
// customer.route.ts, quotation.route.ts, quotation.validator.ts, quotation.service.ts.

export type QuotationStatus = 'DRAFT' | 'APPROVED' | 'REJECTED';

export interface QuotationItem {
  quotationItemId?: string;
  quotationId?: string;
  itemId: string;
  itemName?: string; // snapshot lúc tạo, do backend tự tra từ Item rồi lưu lại
  quantity: number;
  price: number;
  discount?: number;
  lineTotal?: number; // generated column, chỉ có khi đọc lại (GET)
}

// GET /api/v1/customers/:customerId/quotations
export interface Quotation {
  quotationId: string;
  quotationCode: string;
  customerId: string;
  version: string; // vd "v1.0" — chuỗi tự do, KHÔNG auto-increment
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  status: QuotationStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// GET /api/v1/quotations/:id — kèm include items
export interface QuotationDetail extends Quotation {
  items: QuotationItem[];
}

// POST /api/v1/customers/:customerId/quotations, PUT /api/v1/quotations/:id
export interface SaveQuotationPayload {
  version?: string; // bắt buộc khi tạo mới, không dùng khi update
  notes?: string;
  items: { itemId: string; quantity: number; price: number; discount?: number }[]; // tối thiểu 1
}

// PATCH /api/v1/quotations/:id/status
export interface UpdateQuotationStatusPayload {
  status: QuotationStatus;
}
