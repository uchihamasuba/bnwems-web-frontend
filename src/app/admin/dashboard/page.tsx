'use client';

import Link from 'next/link';
import { DollarSign, ShoppingCart, FileText, Users, Plus, ChevronDown } from 'lucide-react';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import RevenueChart from '@/components/reports/RevenueChart';
import OrderStatusDonut from '@/components/dashboard/OrderStatusDonut';
import UpcomingEventsCard from '@/components/dashboard/UpcomingEventsCard';
import RecentOrdersCard from '@/components/dashboard/RecentOrdersCard';
import StaffOnDutyCard from '@/components/dashboard/StaffOnDutyCard';
import { Button } from '@/components/ui/Button';
import {
  MOCK_ADMIN_KPIS,
  MOCK_ORDER_STATUS_BREAKDOWN,
  MOCK_RECENT_ORDERS,
  MOCK_REVENUE_TREND,
  MOCK_STAFF_ON_DUTY,
  MOCK_UPCOMING_EVENTS,
} from '@/mocks/adminDashboard';
import { formatCurrency } from '@/utils/formatCurrency';

// ⚠️ Backend hiện không gọi được (docs/more-require.md mục (jj)) — trang này tạm dùng dữ liệu ảo cố
// định ở src/mocks/adminDashboard.ts thay vì gọi reportApiService. Khôi phục lại API thật khi backend
// hoạt động bình thường trở lại.
export default function Page() {
  const kpis = MOCK_ADMIN_KPIS;
  const totalOrders = MOCK_ORDER_STATUS_BREAKDOWN.reduce((sum, slice) => sum + slice.count, 0);

  const items: KpiCardItem[] = [
    {
      label: 'Doanh thu tháng',
      value: formatCurrency(kpis.monthlyRevenue),
      icon: DollarSign,
      iconColor: 'blue',
      changeLabel: `${kpis.monthlyRevenueChange} so với tháng trước`,
      changeDirection: 'up',
    },
    {
      label: 'Đơn đặt mới',
      value: kpis.newOrders,
      icon: ShoppingCart,
      iconColor: 'green',
      changeLabel: `${kpis.newOrdersChange} so với tháng trước`,
      changeDirection: 'up',
    },
    {
      label: 'Báo giá chờ duyệt',
      value: kpis.pendingQuotations,
      icon: FileText,
      iconColor: 'amber',
      changeLabel: `${kpis.pendingQuotationsChange} so với tháng trước`,
      changeDirection: 'up',
    },
    {
      label: 'Khách hàng mới',
      value: kpis.newCustomers,
      icon: Users,
      iconColor: 'pink',
      changeLabel: `${kpis.newCustomersChange} so với tháng trước`,
      changeDirection: 'up',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi hoạt động kinh doanh và vận hành dịch vụ tiệc cưới.</p>
          <p className="mt-1 text-xs italic text-slate-400" title="Backend hiện không gọi được — dữ liệu minh họa">
            Đang hiển thị dữ liệu minh họa (backend chưa kết nối được).
          </p>
        </div>
        <Link href="/admin/quotations">
          <Button>
            <Plus className="h-4 w-4" />
            Tạo báo giá
            <ChevronDown className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <DashboardStats items={items} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <RevenueChart data={MOCK_REVENUE_TREND} />
        </div>
        <OrderStatusDonut data={MOCK_ORDER_STATUS_BREAKDOWN} total={totalOrders} />
        <UpcomingEventsCard events={MOCK_UPCOMING_EVENTS} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersCard orders={MOCK_RECENT_ORDERS} />
        </div>
        <StaffOnDutyCard staff={MOCK_STAFF_ON_DUTY} />
      </div>
    </div>
  );
}
