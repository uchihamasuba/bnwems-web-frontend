'use client';

import { AlertTriangle, CalendarClock, ClipboardCheck, ShoppingBag } from 'lucide-react';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import OrderStatusDonut from '@/components/dashboard/OrderStatusDonut';
import UpcomingEventsCard from '@/components/dashboard/UpcomingEventsCard';
import PendingConfirmationsCard from '@/components/dashboard/PendingConfirmationsCard';
import RecentOrdersCard from '@/components/dashboard/RecentOrdersCard';
import { MOCK_ORDER_STATUS_BREAKDOWN, MOCK_RECENT_ORDERS, MOCK_UPCOMING_EVENTS } from '@/mocks/adminDashboard';
import { MOCK_MANAGER_KPIS, MOCK_PENDING_CONFIRMATIONS } from '@/mocks/managerDashboard';

// Operational Dashboard của Manager — khác Administrative Dashboard của Admin (thiên về doanh
// thu/audit): tập trung trạng thái order/task/thanh toán/kho và hàng đợi chờ xác nhận (mục 1
// CLAUDE.md). Trang thuần giao diện, dữ liệu ảo cố định — xem giải thích ở đầu managerDashboard.ts.
export default function ManagerDashboardPage() {
  const kpis = MOCK_MANAGER_KPIS;
  const totalOrders = MOCK_ORDER_STATUS_BREAKDOWN.reduce((sum, slice) => sum + slice.count, 0);

  const items: KpiCardItem[] = [
    {
      label: 'Đơn đang xử lý',
      value: kpis.activeOrders,
      icon: ShoppingBag,
      iconColor: 'blue',
      changeLabel: kpis.activeOrdersChange,
      changeDirection: 'up',
    },
    {
      label: 'Chờ xác nhận',
      value: kpis.pendingConfirmations,
      icon: ClipboardCheck,
      iconColor: 'amber',
      changeLabel: kpis.pendingConfirmationsChange,
      changeDirection: 'up',
    },
    {
      label: 'Việc cần làm hôm nay',
      value: kpis.tasksToday,
      icon: CalendarClock,
      iconColor: 'green',
      changeLabel: kpis.tasksTodayChange,
      changeDirection: 'up',
    },
    {
      label: 'Cảnh báo tồn kho',
      value: kpis.inventoryAlerts,
      icon: AlertTriangle,
      iconColor: 'red',
      changeLabel: kpis.inventoryAlertsChange,
      changeDirection: 'down',
    },
  ];

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi trạng thái đơn hàng, công việc hiện trường và các mục chờ xác nhận.</p>
        <p className="mt-1 text-xs italic text-slate-400">Đang hiển thị dữ liệu minh họa (giao diện thuần, chưa nối API báo cáo thật).</p>
      </div>

      <div className="mt-6">
        <DashboardStats items={items} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <PendingConfirmationsCard items={MOCK_PENDING_CONFIRMATIONS} />
        </div>
        <OrderStatusDonut data={MOCK_ORDER_STATUS_BREAKDOWN} total={totalOrders} viewDetailHref="/manager/orders" />
        <UpcomingEventsCard events={MOCK_UPCOMING_EVENTS} viewAllHref="/manager/orders" />
      </div>

      <div className="mt-6">
        <RecentOrdersCard orders={MOCK_RECENT_ORDERS} />
      </div>
    </div>
  );
}
