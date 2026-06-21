export interface Report {
  id: number;
}

// Số liệu giả định cho UC26 (Administrative Dashboard) — docs/api chưa chốt field cho endpoint này,
// chỉ có endpoint Operational Dashboard (UC39B, /dashboard/operations) cho Manager.
export interface AdminDashboardStats {
  total_orders: number;
  total_revenue: number;
  pending_audit_count: number;
  low_stock_alerts: number;
}
