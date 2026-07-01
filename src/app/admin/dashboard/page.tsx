'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Wallet, Receipt, ArrowRight } from 'lucide-react';
import { reportApiService } from '@/services/report.service';
import { AdminDashboardStats, RevenueReportPoint } from '@/types/report';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import RevenueChart from '@/components/reports/RevenueChart';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';

export default function Page() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<RevenueReportPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const endDate = new Date().toISOString();
    const startDateDate = new Date();
    startDateDate.setFullYear(startDateDate.getFullYear() - 1);
    const startDate = startDateDate.toISOString();
    
    Promise.all([reportApiService.getAdminDashboard(), reportApiService.getRevenueReport({ startDate, endDate })])
      .then(([dashboardRes, revenueRes]) => {
        setStats(dashboardRes.data);
        setRevenueSeries(revenueRes.data.breakdownByMonth);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const items: KpiCardItem[] = stats
    ? [
        { label: 'Đơn hàng đang hoạt động', value: stats.activeOrders, icon: ClipboardList, iconColor: 'blue' },
        { label: 'Doanh thu tháng này', value: formatCurrency(stats.totalRevenueMonth), icon: Wallet, iconColor: 'green' },
        { label: 'Công nợ NCC chưa trả', value: formatCurrency(stats.unpaidSupplierDebt), icon: Receipt, iconColor: 'amber' },
      ]
    : [];

  return (
    <div className="p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Tổng quan quản trị</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi đơn hàng, doanh thu và công nợ nhà cung cấp.</p>
      </div>

      {isLoading || !stats ? (
        <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-6 space-y-6">
          <DashboardStats items={items} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueChart data={revenueSeries} />
            </div>

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Đơn hàng gần đây</h3>
                <Link
                  href="/admin/orders_audit"
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Xem tất cả
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-3 flex flex-col gap-1">
                {stats.recentOrders.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">Không có đơn hàng nào.</p>
                )}
                {stats.recentOrders.map((order) => (
                  <Link
                    key={order.orderId}
                    href={`/admin/orders_audit/${order.orderId}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <ClipboardList className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-slate-700">{order.orderId}</span>
                    </span>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
