// docs/api/03-catalog.md — ĐÃ LỖI THỜI sau đợt backend refactor 2026-07-06. Kiến trúc thật là 3
// tầng Category → Type → Item (không còn itemType enum SERVICE/EQUIPMENT/MATERIAL/PACKAGE hay
// basePrice). Equipment (bảng riêng cũ) đã gộp hẳn vào Item — xem docs/more-require.md.
// Nguồn: D:\bnwems-backend-api prisma/schema.prisma (ItemCategory/ItemType/Item/ItemTypeSpec),
// catalog.route.ts, catalog.validator.ts, catalog.service.ts.

export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

// GET /api/v1/catalog/categories — KHÔNG có isActive (cột không tồn tại trong DB)
export interface ItemCategory {
  categoryId: string;
  categoryName: string;
  description?: string;
}

export interface CreateItemCategoryPayload {
  categoryName: string;
  description?: string;
}

export type UpdateItemCategoryPayload = CreateItemCategoryPayload;

// PATCH /api/v1/catalog/categories/:id/status — backend hiện là NO-OP STUB (không có cột isActive
// trên ItemCategory), chỉ trả {success:true} chứ không đổi gì thật — xem docs/more-require.md.
export interface UpdateItemCategoryStatusPayload {
  isActive: boolean;
}

// GET /api/v1/catalog/types
export interface ItemType {
  typeId: string;
  categoryId: string;
  typeName: string;
  description?: string;
  categoryName?: string; // join thêm khi GET
}

export interface CreateItemTypePayload {
  categoryId: string;
  typeName: string;
  description?: string;
}

export interface UpdateItemTypePayload {
  categoryId?: string;
  typeName: string;
  description?: string;
}

// GET/POST /api/v1/catalog/types/:id/specs — BOM (cấu hình linh kiện con của 1 loại thiết bị)
export interface ItemTypeSpec {
  specId?: string;
  typeId: string;
  componentItemId: string;
  componentName?: string; // join thêm khi GET (tên của componentItem)
  quantity: number;
  note?: string;
}

// POST .../specs — thay TOÀN BỘ danh sách specs của 1 type
export interface UpdateTypeSpecsPayload {
  specs: { componentItemId: string; quantity: number; note?: string }[];
}

// GET /api/v1/catalog/items
export interface Item {
  itemId: string;
  itemCode: string;
  itemName: string;
  typeId: string;
  description?: string;
  unit: string;
  rentalPrice: number;
  priceValidFrom?: string;
  priceValidTo?: string;
  imageUrl?: string;
  status: ItemStatus;
  typeName?: string; // join thêm khi GET
  inventory?: { quantityTotal: number; quantityAvailable: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  itemCode: string;
  itemName: string;
  typeId: string;
  description?: string;
  unit: string;
  rentalPrice: number;
  priceValidFrom?: string;
  imageUrl?: string;
  status?: ItemStatus;
}

export interface UpdateItemPayload {
  itemName?: string;
  description?: string;
  typeId?: string;
  unit?: string;
  rentalPrice?: number;
  priceValidFrom?: string;
  imageUrl?: string;
  status?: ItemStatus;
}

// PATCH /api/v1/catalog/items/:id/status
export interface UpdateItemStatusPayload {
  status: ItemStatus;
}
