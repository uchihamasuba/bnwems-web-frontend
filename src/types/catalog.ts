// UC 2.5 — Master Data & Policies: Catalog Management (docs/api/03-catalog.md)
// Lưu ý: doc mới không còn `code`/`unit`/quantity/warehouse trên CatalogItem — thay bằng
// `itemType` (enum) phân loại trực tiếp + `basePrice`. CatalogCategory nhóm CatalogItem một
// cách tùy chọn qua `categoryId` (không còn lịch sử giá riêng, /prices, như bản cũ).

export type CatalogItemType = 'SERVICE' | 'EQUIPMENT' | 'MATERIAL' | 'PACKAGE';

// GET /api/v1/catalog-items, GET /api/v1/catalog-items/:id
export interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  itemType: CatalogItemType;
  basePrice: number;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// POST /api/v1/catalog-items
export interface CreateCatalogItemPayload {
  name: string;
  description?: string;
  itemType: CatalogItemType;
  basePrice: number;
  categoryId?: string | null;
}

// PUT /api/v1/catalog-items/:id — itemType không nằm trong body update theo doc (bất biến sau khi tạo).
export interface UpdateCatalogItemPayload {
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string | null;
}

// PUT /api/v1/catalog-items/:id/deactivate
export interface UpdateCatalogItemStatusPayload {
  isActive: boolean;
}

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
