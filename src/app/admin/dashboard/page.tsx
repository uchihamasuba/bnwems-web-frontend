'use client';

import { useEffect, useState } from 'react';
import { reportApiService } from '@/services/report.service';
import { AdminDashboardStats } from '@/types/report';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import { formatCurrency } from '@/utils/formatCurrency';

export default function Page() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    reportApiService
      .getAdminDashboard()
      .then((res) => setStats(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  const items: KpiCardItem[] = stats
    ? [
        { label: 'Tổng số đơn hàng', value: stats.total_orders },
        { label: 'Tổng doanh thu', value: formatCurrency(stats.total_revenue) },
        { label: 'Chờ audit', value: stats.pending_audit_count },
        { label: 'Cảnh báo tồn kho thấp', value: stats.low_stock_alerts },
      ]
    : [];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">Tổng quan quản trị</h1>
      <p className="mt-1 text-sm text-slate-500">Số liệu tổng hợp phục vụ audit và giám sát hệ thống.</p>
      <div className="mt-6">
        {isLoading ? <p className="text-sm text-slate-400">Đang tải...</p> : <DashboardStats items={items} />}
      </div>
    </div>
  );
}
