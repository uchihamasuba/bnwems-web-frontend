// UC 2.5 — Equipment Management (docs/api/03-catalog.md)
// Equipment là tên mới của CatalogItem ở backend ("formerly CatalogItem" — xem 03-catalog.md
// dòng 4). docs/api/15-catalog-categories-items.md vẫn giữ path /catalog-items cũ nhưng ghi rõ
// chỉ để tương thích ngược và không có schema kèm theo — dùng entity Equipment ở đây làm chuẩn.
// Lưu ý: `category` giờ là chuỗi mô tả tự do trên Equipment, không còn là categoryId liên kết
// quan hệ tới CatalogCategory (xem types/catalog.ts).

export type EquipmentStatus = 'active' | 'inactive';

// GET /api/v1/equipment, GET /api/v1/equipment/:id
export interface EquipmentItem {
  equipmentItemId: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  rentalPrice: number;
  costPrice: number;
  replacementValue: number;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt?: string;
}

// POST /api/v1/equipment
export interface CreateEquipmentPayload {
  code: string;
  name: string;
  category: string;
  unit: string;
  rentalPrice: number;
  costPrice: number;
  replacementValue: number;
}

// PUT /api/v1/equipment/:id
export interface UpdateEquipmentPayload {
  name: string;
  category: string;
  unit: string;
  rentalPrice: number;
  costPrice: number;
  replacementValue: number;
}

// PATCH /api/v1/equipment/:id/status
export interface UpdateEquipmentStatusPayload {
  status: EquipmentStatus;
}
