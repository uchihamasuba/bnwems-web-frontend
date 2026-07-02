'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Boxes,
  Wallet,
  ShoppingBag,
  Wrench,
  Receipt,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { reportApiService } from '@/services/report.service';
import { userApiService } from '@/services/user.service';
import { inventoryApiService } from '@/services/inventory.service';
import { policyApiService } from '@/services/policy.service';
import { AdminDashboardStats, RevenueReportPoint } from '@/types/report';
import type { InventoryRow } from '@/types/inventory';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import RevenueChart from '@/components/reports/RevenueChart';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';

interface ExtraKpis {
  userCount: number;
  availableInventory: number;
  damagedInventory: number;
  activePolicyCount: number;
}

export default function Page() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<RevenueReportPoint[]>([]);
  const [extraKpis, setExtraKpis] = useState<ExtraKpis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // BR-07-01 (docs/api/13-reports.md): startDate/endDate là bắt buộc cho /reports/revenue —
    // mặc định lấy 12 tháng gần nhất cho biểu đồ doanh thu theo tháng.
    const today = new Date();
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const toISODate = (d: Date) => d.toISOString().slice(0, 10);

    Promise.all([
      reportApiService.getAdminDashboard(),
      reportApiService.getRevenueReport({ startDate: toISODate(twelveMonthsAgo), endDate: toISODate(today) }),
      userApiService.getUsers({ limit: 1 }),
      // Không có endpoint tổng hợp tồn kho — lấy một trang lớn rồi cộng dồn ở client
      // (cùng pattern với admin/inventory/maintenance).
      inventoryApiService.getInventory({ limit: 500 }),
      policyApiService.getPolicies({ isActive: true }),
    ]).then(([dashboardRes, revenueRes, usersRes, inventoryRes, policiesRes]) => {
      setStats(dashboardRes.data);
      setRevenueSeries(revenueRes.data.breakdownByMonth);

      const inventoryRows = inventoryRes.data as InventoryRow[];
      setExtraKpis({
        userCount: usersRes.meta?.totalCount ?? 0,
        availableInventory: inventoryRows.reduce((sum, row) => sum + row.availableQuantity, 0),
        damagedInventory: inventoryRows.reduce((sum, row) => sum + row.damagedQuantity, 0),
        activePolicyCount: policiesRes.meta?.totalCount ?? policiesRes.data.length,
      });
      setIsLoading(false);
    });
  }, []);

  const items: KpiCardItem[] = stats && extraKpis
    ? [
        { label: 'Người dùng', value: extraKpis.userCount, icon: Users, iconColor: 'blue' },
        { label: 'Thiết bị sẵn sàng kho', value: extraKpis.availableInventory, icon: Boxes, iconColor: 'blue' },
        { label: 'Doanh thu tháng này', value: formatCurrency(stats.totalRevenueMonth), icon: Wallet, iconColor: 'green' },
        { label: 'Đơn hàng đang hoạt động', value: stats.activeOrders, icon: ShoppingBag, iconColor: 'blue' },
        { label: 'Cần bảo trì', value: extraKpis.damagedInventory, icon: Wrench, iconColor: 'amber' },
        { label: 'Công nợ NCC chưa trả', value: formatCurrency(stats.unpaidSupplierDebt), icon: Receipt, iconColor: 'amber' },
        { label: 'Chính sách đang áp dụng', value: extraKpis.activePolicyCount, icon: ShieldCheck, iconColor: 'blue' },
      ]
    : [];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tổng quan quản trị</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi người dùng, kho, doanh thu, đơn hàng, công nợ nhà cung cấp và chính sách áp dụng.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400">
          Giám sát hệ thống thời gian thực: chưa tích hợp
        </div>
      </div>

      {isLoading || !stats || !extraKpis ? (
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

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cảnh báo vận hành & bảo mật</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Cần bổ sung endpoint tổng hợp cảnh báo (audit log, khóa tài khoản, thiết bị sự cố...) từ backend.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-sm text-slate-400">
              Chưa có nguồn dữ liệu cảnh báo hệ thống — sẽ hiển thị khi API tương ứng sẵn sàng.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
