// UC 2.13 / UC 2.23 — Inventory Management (docs/api/05-warehouse-inventory.md)
// Entity `Warehouse` đã bị xóa bỏ hoàn toàn khỏi contract mới — không còn warehouseId,
// checkedOutQuantity, lostQuantity trên Inventory; thêm totalQuantity trả thẳng từ API (không
// cần tự cộng dồn ở client nữa). catalogItemId đổi tên thành equipmentItemId (xem
// types/equipment.ts — Equipment là CatalogItem cũ). WarehouseHistory đổi thành InventoryReport.

// GET /api/v1/inventory
export interface InventoryRow {
  inventoryId: string;
  equipmentItemId: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
}

export interface GetInventoryQuery {
  equipmentItemId?: string;
  page?: number;
  limit?: number;
}

// POST /api/v1/inventory
export interface CreateInventoryRequest {
  equipmentItemId: string;
  availableQuantity: number;
}

// PUT /api/v1/inventory/:id
export interface UpdateInventoryRequest {
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
}

// GET /api/v1/inventory/availability
export interface InventoryAvailability {
  equipmentItemId: string;
  isAvailable: boolean;
  availableQuantityOnDate: number;
}

export interface GetInventoryAvailabilityQuery {
  eventDate: string;
  equipmentItemId: string;
}

// POST /api/v1/inventory/reserve
export interface ReserveInventoryItem {
  equipmentItemId: string;
  quantity: number;
}

export interface ReserveInventoryRequest {
  orderId: string;
  items: ReserveInventoryItem[];
}

// GET /api/v1/inventory/inventory-reports
export type InventoryReportType = 'checkout' | 'return' | 'adjustment' | 'damage_loss';

export interface InventoryReport {
  inventoryReportId: string;
  orderId: string;
  reportType: InventoryReportType;
  reportedBy: string;
  createdAt: string;
}

export interface GetInventoryReportsQuery {
  reportType?: InventoryReportType;
  page?: number;
  limit?: number;
}

// POST /api/v1/inventory/checkout
export interface CheckoutInventoryItem {
  equipmentItemId: string;
  quantity: number;
}

export interface CheckoutInventoryRequest {
  orderId: string;
  items: CheckoutInventoryItem[];
}

// POST /api/v1/inventory/return
export type InventoryItemCondition = 'good' | 'damaged';

export interface ReturnInventoryItem {
  equipmentItemId: string;
  quantity: number;
  condition: InventoryItemCondition;
}

export interface ReturnInventoryRequest {
  orderId: string;
  items: ReturnInventoryItem[];
}
