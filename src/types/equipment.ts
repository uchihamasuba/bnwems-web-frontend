// GET /api/v1/equipment — endpoint chưa được ghi nhận trong docs/api/ (chỉ có 03-catalog.md mô tả
// `/catalog-items`, module `CatalogItem`). Xác nhận bằng cách đọc trực tiếp D:\bnwems-backend-api
// (equipment.route.ts, equipment.controller.ts, equipment.service.ts, prisma/schema.prisma model
// Equipment) — đây là bảng RIÊNG với CatalogItem, và là bảng thật mà QuotationItem.equipmentItemId
// tham chiếu tới. Xem docs/more-require.md mục (aa).
export interface EquipmentItem {
  equipmentItemId: string;
  code: string;
  name: string;
  category: string | null;
  unit: string | null;
  rentalPrice: number;
  costPrice: number;
  replacementValue: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
