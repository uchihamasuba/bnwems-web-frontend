// UC 2.10 (docs/api/08-quotations.md)
// ⚠️ Đã sửa lại theo response thật (xác nhận bằng cách chạy thật + đọc trực tiếp
// D:\bnwems-backend-api\src\services\quotation.service.ts) — KHÔNG khớp hoàn toàn với
// docs/api/08-quotations.md:
// - Field id thật là `quotationId` (Prisma không rename), không phải `id`.
// - `getQuotationsByOrder` dùng `prisma.quotation.findUnique({where:{orderId}})` — mỗi order
//   chỉ có TỐI ĐA 1 quotation thật, "version" luôn hardcode = 1 ở phía service — tính năng
//   versioning (nhiều bản báo giá/đơn) mô tả trong CLAUDE.md/doc UC 2.10 CHƯA được implement thật.
// - status thật chỉ ghi 'draft'/'confirmed' (chữ thường); 'SENT' chỉ xuất hiện trong 1 điều kiện
//   kiểm tra ở updateQuotation nhưng không nơi nào thực sự set giá trị này — coi như chưa dùng.
// - GET /quotations/:id trả `items` ở TOP-LEVEL (không nested trong `details.items`), và field
//   item thật là `unitPrice` + `lineTotal` có sẵn (không phải `price`).
// Xem docs/more-require.md mục (m) để biết chi tiết gửi backend team.
export type QuotationStatus = 'draft' | 'confirmed';

export interface QuotationItem {
  id: string;
  quotationId: string;
  catalogItemId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// GET /api/v1/orders/:orderId/quotations — trả tối đa 1 phần tử (xem ghi chú versioning trên)
export interface Quotation {
  quotationId: string;
  orderId: string;
  customerId: string;
  version: number; // luôn = 1 ở backend thật hiện tại
  subtotal: number; // = totalAmount (backend không có cột subtotal riêng)
  tax: number; // luôn = 0 ở backend thật hiện tại
  discount: number; // luôn = 0 ở backend thật hiện tại
  totalAmount: number;
  status: QuotationStatus;
  createdAt: string;
}

// GET /api/v1/quotations/:id
export interface QuotationDetail extends Quotation {
  items: QuotationItem[];
  updatedAt: string;
}

// POST /api/v1/orders/:orderId/quotations, PUT /api/v1/quotations/:id
export interface SaveQuotationPayload {
  totalAmount: number;
  items: { catalogItemId: string; quantity: number; unitPrice: number }[];
}
