// UC 2.5 — Catalog Category Management (docs/api/15-catalog-categories-items.md)
// Module CatalogItem cũ đã đổi tên thành Equipment ở backend — xem types/equipment.ts,
// services/equipment.service.ts. File này chỉ còn giữ CatalogCategory vì
// docs/api/15-catalog-categories-items.md vẫn khai báo /catalog-categories riêng, không đổi
// theo Equipment (không có schema field chi tiết, giữ nguyên field cũ đã xác nhận hoạt động).

// GET /api/v1/catalog-categories, GET /api/v1/catalog-categories/:id
export interface CatalogCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  notes: string | null;
  isActive: boolean;
  totalEquipment: number;
  createdAt: string;
  updatedAt?: string;
}

// POST /api/v1/catalog-categories
export interface CreateCatalogCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
  notes?: string | null;
}

// PUT /api/v1/catalog-categories/:id
export interface UpdateCatalogCategoryPayload {
  name: string;
  description?: string;
  displayOrder?: number;
  notes?: string | null;
}

// PUT /api/v1/catalog-categories/:id/deactivate
export interface UpdateCatalogCategoryStatusPayload {
  isActive: boolean;
}
