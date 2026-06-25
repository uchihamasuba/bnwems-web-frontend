// UC 2.7, 2.8 (docs/api/13-reports.md)

// GET /api/v1/dashboard/admin
export interface AdminDashboardStats {
  activeOrders: number;
  totalRevenueMonth: number;
  unpaidSupplierDebt: number;
  recentOrders: { orderId: string; status: string }[];
}

// GET /api/v1/dashboard/manager
export interface ManagerDashboardStats {
  ordersInProgress: number;
  pendingChangeRequests: number;
  tasksToday: number;
  alerts: { type: string; taskId: string }[];
}

// GET /api/v1/reports/revenue
export interface RevenueReportPoint {
  month: string;
  revenue: number;
}

export interface RevenueReport {
  totalRevenue: number;
  breakdownByMonth: RevenueReportPoint[];
  topCustomers: { customerId: string; revenue: number }[];
}

// GET /api/v1/reports/inventory
export interface InventoryReport {
  totalDamaged: number;
  totalLost: number;
  mostUsedItems: { catalogItemId: string; itemName: string; usageCount: number }[];
}
