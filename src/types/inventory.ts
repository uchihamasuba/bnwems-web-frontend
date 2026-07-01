// UC 2.13 / UC 2.23 — Inventory & Warehouse Management (docs/api/05-warehouse-inventory.md)
// Lưu ý: doc API mới KHÔNG còn endpoint liệt kê kho (GET /warehouses) — warehouseId chỉ
// dùng để lọc/tham chiếu, không có cách tra tên/địa chỉ kho từ FE nữa.

// GET /api/v1/inventory
export interface InventoryRow {
  id: string;
  warehouseId: string;
  catalogItemId: string;
  availableQuantity: number;
  reservedQuantity: number;
  checkedOutQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
  updatedAt: string;
}

export interface GetInventoryQuery {
  warehouseId?: string;
  catalogItemId?: string;
  page?: number;
  limit?: number;
}

// POST /api/v1/inventory — KHÔNG có trong docs/api/05-warehouse-inventory.md. Thêm tạm ở
// phía code/mock để hỗ trợ UI "Thêm tồn kho" ở /admin/inventory/stock-status; cần đồng bộ
// lại doc + backend thật khi có endpoint chính thức.
export interface CreateInventoryRequest {
  warehouseId: string;
  catalogItemId: string;
  availableQuantity: number;
}

// PUT /api/v1/inventory/:id — KHÔNG có trong docs/api/05-warehouse-inventory.md. Thêm tạm để
// hỗ trợ UI "Sửa tồn kho" (điều chỉnh số lượng thủ công); cần đồng bộ lại doc + backend thật.
export interface UpdateInventoryRequest {
  availableQuantity: number;
  reservedQuantity: number;
  checkedOutQuantity: number;
  damagedQuantity: number;
  lostQuantity: number;
}

// GET /api/v1/inventory/availability
export interface InventoryAvailability {
  catalogItemId: string;
  isAvailable: boolean;
  availableQuantityOnDate: number;
}

export interface GetInventoryAvailabilityQuery {
  eventDate: string;
  itemId: string;
}

// POST /api/v1/inventory/reserve
export interface ReserveInventoryItem {
  catalogItemId: string;
  quantity: number;
}

export interface ReserveInventoryRequest {
  orderId: string;
  items: ReserveInventoryItem[];
}

// GET /api/v1/warehouse-histories
export type WarehouseTransactionType = 'CHECKOUT' | 'RETURN' | 'ADJUSTMENT';

export interface WarehouseHistory {
  id: string;
  warehouseId: string;
  transactionType: WarehouseTransactionType;
  performedBy: string;
  createdAt: string;
}

export interface GetWarehouseHistoriesQuery {
  transactionType?: WarehouseTransactionType;
  page?: number;
  limit?: number;
}

// POST /api/v1/inventory/checkout
export interface CheckoutInventoryItem {
  equipmentItemId: number;
  quantity: number;
}

export interface CheckoutInventoryRequest {
  orderId: number;
  items: CheckoutInventoryItem[];
}

// POST /api/v1/inventory/return
export type InventoryItemCondition = 'good' | 'damaged' | 'lost';

export interface ReturnInventoryItem {
  equipmentItemId: number;
  quantity: number;
  condition?: InventoryItemCondition;
}

export interface ReturnInventoryRequest {
  orderId: number;
  items: ReturnInventoryItem[];
}

