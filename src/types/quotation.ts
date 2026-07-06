// UC 2.10 (docs/api/08-quotations.md)
// ⚠️ Đã sửa lại theo response thật (xác nhận bằng cách chạy thật + đọc trực tiếp
// D:\bnwems-backend-api\src\services\quotation.service.ts) — KHÔNG khớp hoàn toàn với
// docs/api/08-quotations.md:
// - Field id thật là `quotationId` (Prisma không rename), không phải `id`.
// - status thật chỉ ghi 'draft'/'confirmed' (chữ thường); 'SENT' chỉ xuất hiện trong 1 điều kiện
//   kiểm tra ở updateQuotation nhưng không nơi nào thực sự set giá trị này — coi như chưa dùng.
// - GET /quotations/:id trả `items` ở TOP-LEVEL (không nested trong `details.items`), và field
//   item thật là `unitPrice` + `lineTotal` có sẵn (không phải `price`).
// - Item tham chiếu `equipmentItemId` (bảng `Equipment`), KHÔNG phải `catalogItemId` (bảng
//   `CatalogItem`) — 2 bảng khác nhau, xem docs/more-require.md mục (aa) + src/types/equipment.ts.
// - Versioning ĐÃ ĐƯỢC TRIỂN KHAI THẬT (rà soát lại 2026-07-04): `getQuotationsByOrder` trả nhiều
//   bản ghi theo `orderId` (sắp version desc, có phân trang), `version` là cột thật (không còn
//   hardcode = 1). Xem docs/more-require.md mục (m).
export type QuotationStatus = 'draft' | 'confirmed';

export interface QuotationItem {
  id: string;
  quotationId: string;
  equipmentItemId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// GET /api/v1/orders/:orderId/quotations — danh sách các phiên bản báo giá của 1 đơn hàng
export interface Quotation {
  quotationId: string;
  orderId: string;
  customerId: string;
  version: number;
  subtotal: number; // = totalAmount trong thực tế (FE không gửi subtotal/tax/discount riêng khi tạo)
  tax: number; // luôn = 0 trong thực tế hiện tại
  discount: number; // luôn = 0 trong thực tế hiện tại
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
// ⚠️ Xác nhận bằng cách gọi POST thật (không chỉ đọc doc): backend validator
// (createQuotationSchema, D:\bnwems-backend-api\src\validators\quotation.validator.ts) bắt buộc
// `subtotal` là number required — thiếu field này trả 400 "body.subtotal: Invalid input: expected
// number, received undefined". `tax`/`discount` vẫn optional (service tự mặc định 0 nếu bỏ trống).
// ⚠️ `updateQuotation` LUÔN ghi đè tax = data.tax || 0 (quotation.service.ts:114) — không có field
// nào bị bỏ trống thì giữ nguyên giá trị cũ, nên FE phải luôn gửi lại đúng `tax` mong muốn mỗi lần
// sửa, không chỉ gửi khi có thay đổi.
export interface SaveQuotationPayload {
  subtotal: number;
  tax?: number;
  totalAmount: number;
  items: { equipmentItemId: string; quantity: number; unitPrice: number }[];
}
