'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  RefreshCw,
  CalendarCheck,
  AlertTriangle,
  Plus,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { reportApiService } from '@/services/report.service';
import { orderApiService } from '@/services/order.service';
import { schedulePlanApiService } from '@/services/schedulePlan.service';
import { changeRequestApiService } from '@/services/changeRequest.service';
import { ManagerDashboardStats } from '@/types/report';
import { Order } from '@/types/order';
import { SchedulePlan } from '@/types/schedulePlan';
import { ChangeRequest } from '@/types/changeRequest';
import { useAuth } from '@/hooks/useAuth';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import ScheduleTimeline from '@/components/dashboard/ScheduleTimeline';
import ApprovalCard from '@/components/dashboard/ApprovalCard';
import ActivityFeed, { ActivityFeedItem } from '@/components/dashboard/ActivityFeed';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}


export default function Page() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [schedules, setSchedules] = useState<SchedulePlan[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const loadDashboard = () => {
    return Promise.all([
      reportApiService.getManagerDashboard(),
      orderApiService.getOrders({ limit: 5 }),
      schedulePlanApiService.getSchedulePlans({ limit: 100 }),
      changeRequestApiService.getChangeRequests({ status: 'pending', limit: 5 }),
    ]).then(([dashboardRes, ordersRes, schedulesRes, changeRequestsRes]) => {
      setStats(dashboardRes.data);
      setOrders(ordersRes.data);
      setSchedules(schedulesRes.data);
      setChangeRequests(changeRequestsRes.data);
    });
  };

  useEffect(() => {
    loadDashboard().finally(() => setIsLoading(false));
  }, []);

  const orderById = useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders]);
  const alertedTaskIds = useMemo(
    () => new Set((stats?.alerts ?? []).map((a) => a.warningId)),
    [stats]
  );

  const handleApprove = async (changeRequestId: string, status: 'approved' | 'rejected') => {
    await changeRequestApiService.approveChangeRequest(changeRequestId, status);
    loadDashboard();
  };

  const activityFeed: ActivityFeedItem[] = useMemo(() => {
    const feedItems: ActivityFeedItem[] = [];

    for (const order of orders) {
      feedItems.push({
        key: `order-${order.orderId}`,
        time: new Date(order.createdAt).getTime(),
        icon: ClipboardList,
        iconColor: 'blue',
        message: (
          <>
            Đơn hàng <span className="font-medium text-slate-700">#{order.orderId}</span> đang ở trạng thái{' '}
            <span className="font-medium text-slate-700">{ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}</span>.
          </>
        ),
      });
    }

    for (const cr of changeRequests) {
      const order = orderById.get(cr.orderId);
      feedItems.push({
        key: `cr-${cr.changeRequestId}`,
        time: new Date(cr.createdAt).getTime(),
        icon: RefreshCw,
        iconColor: 'amber',
        message: (
          <>
            Yêu cầu thay đổi thiết bị cho đơn{' '}
            <span className="font-medium text-slate-700">#{order?.orderId ?? cr.orderId}</span> đang chờ phê duyệt.
          </>
        ),
      });
    }

    for (const plan of schedules) {
      if (plan.status !== 'COMPLETED') continue;
      const order = orderById.get(plan.orderId);
      feedItems.push({
        key: `plan-${plan.planId}`,
        time: new Date(plan.updatedAt).getTime(),
        icon: CheckCircle2,
        iconColor: 'green',
        message: (
          <>
            Công việc <span className="font-medium text-slate-700">{plan.taskName ?? `Task #${plan.taskId}`}</span> cho đơn{' '}
            <span className="font-medium text-slate-700">#{order?.orderId ?? plan.orderId}</span> đã hoàn thành.
          </>
        ),
      });
    }

    return feedItems.toSorted((a, b) => b.time - a.time).slice(0, 5);
  }, [orders, changeRequests, schedules, orderById]);

  const items: KpiCardItem[] = stats
    ? [
        { label: 'Đơn hàng đang thực hiện', value: stats.ordersInProgress, icon: ClipboardList, iconColor: 'blue' },
        { label: 'Cảnh báo chưa xử lý', value: stats.pendingWarnings, icon: RefreshCw, iconColor: 'amber' },
        { label: 'Công việc hôm nay', value: stats.tasksToday, icon: CalendarCheck, iconColor: 'blue' },
        {
          label: 'Cảnh báo cần chú ý',
          value: stats.alerts.length,
          icon: AlertTriangle,
          iconColor: stats.alerts.length > 0 ? 'red' : 'green',
          changeLabel: stats.alerts.length > 0 ? 'Cần chú ý' : undefined,
          changeDirection: 'down',
        },
      ]
    : [];

  const todayLabel = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="min-h-full bg-slate-50 p-6"
    >
      {/* Section 1 — Greeting + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {greetingForNow()}, {user?.fullName ?? 'Quản lý'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="capitalize">{todayLabel}</span> · Dưới đây là tổng quan vận hành hôm nay.
          </p>
        </div>
        <Link
          href="/manager/orders"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors duration-150 hover:bg-blue-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Tạo đơn hàng
        </Link>
      </div>

      {isLoading || !stats ? (
        <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {/* Section 2 — KPI Cards */}
          <DashboardStats items={items} />

          {/* Section 3 — Lịch trình + Hoạt động gần đây (8) / Yêu cầu chờ xử lý (4) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <ScheduleTimeline
                viewDate={viewDate}
                selectedDate={selectedDate}
                onViewDateChange={setViewDate}
                onSelectedDateChange={setSelectedDate}
                schedules={schedules}
                alertedTaskIds={alertedTaskIds}
                orderById={orderById}
                scheduleHref="/manager/schedule/plans"
              />
              <ActivityFeed items={activityFeed} />
            </div>

            <div className="lg:col-span-4">
              <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                    <MessageSquare className="h-3 w-3" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">Yêu cầu chờ xử lý</h3>
                </div>

                <div className="mt-4 flex-1 space-y-3">
                  {changeRequests.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-400">Không có yêu cầu nào chờ xử lý.</p>
                  )}
                  {changeRequests.map((cr) => (
                    <ApprovalCard
                      key={cr.changeRequestId}
                      changeRequest={cr}
                      order={orderById.get(cr.orderId)}
                      onApprove={() => handleApprove(cr.changeRequestId, 'approved')}
                      onReject={() => handleApprove(cr.changeRequestId, 'rejected')}
                    />
                  ))}
                </div>

                <Link
                  href="/manager/field-ops/change-requests"
                  className="mt-4 flex items-center justify-center rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                >
                  Xem tất cả yêu cầu
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
