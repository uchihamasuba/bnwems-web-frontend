// UC 2.13 / UC 2.23 — Inventory & Warehouse Management (docs/api/05-warehouse-inventory.md)

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

// POST /api/v1/inventory/adjust
export type InventoryAdjustmentType = 'IMPORT' | 'EXPORT' | 'DAMAGED' | 'LOST' | 'FOUND';

export interface AdjustInventoryRequest {
  catalogItemId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reason?: string;
}

// GET /api/v1/inventory/movements
export interface InventoryMovement {
  movementId: string;
  catalogItemId: string;
  type: string;
  quantity: number;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface GetInventoryMovementsQuery {
  catalogItemId?: string;
  type?: string;
  page?: number;
  limit?: number;
}
