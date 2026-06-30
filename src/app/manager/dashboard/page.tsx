'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ClipboardList,
  RefreshCw,
  CalendarCheck,
  AlertTriangle,
  Plus,
  CalendarDays,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { reportApiService } from '@/services/report.service';
import { orderApiService } from '@/services/order.service';
import { workTaskApiService } from '@/services/workTask.service';
import { changeRequestApiService } from '@/services/changeRequest.service';
import { ManagerDashboardStats } from '@/types/report';
import { Order } from '@/types/order';
import { WorkTask } from '@/types/workTask';
import { ChangeRequest } from '@/types/changeRequest';
import { useAuth } from '@/hooks/useAuth';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import ScheduleTimeline from '@/components/dashboard/ScheduleTimeline';
import ApprovalCard from '@/components/dashboard/ApprovalCard';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import ActivityFeed, { ActivityFeedItem } from '@/components/dashboard/ActivityFeed';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';

const TASK_TYPE_LABEL: Record<string, string> = {
  preparation: 'Chuẩn bị',
  installation: 'Thi công / Lắp đặt',
  transport: 'Vận chuyển',
  collection: 'Thu hồi',
};

function humanizeTaskType(taskType: string): string {
  return TASK_TYPE_LABEL[taskType] ?? taskType.replaceAll('_', ' ');
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 14) return 'Chào buổi trưa';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

// Dữ liệu minh họa cho 2 chart chưa có endpoint thật phía Manager (doanh thu thuộc
// phạm vi Admin Dashboard theo CLAUDE.md, hiệu suất thiết bị chưa có report API riêng).
const ORDERS_TREND_PLACEHOLDER = [
  { month: 'T1', orders: 8 },
  { month: 'T2', orders: 12 },
  { month: 'T3', orders: 10 },
  { month: 'T4', orders: 16 },
  { month: 'T5', orders: 19 },
  { month: 'T6', orders: 15 },
];

const REVENUE_PLACEHOLDER = [
  { month: 'T1', revenue: 120 },
  { month: 'T2', revenue: 180 },
  { month: 'T3', revenue: 150 },
  { month: 'T4', revenue: 220 },
  { month: 'T5', revenue: 260 },
  { month: 'T6', revenue: 210 },
];

const EQUIPMENT_UTILIZATION_PLACEHOLDER = [
  { category: 'Âm thanh', utilization: 82 },
  { category: 'Ánh sáng', utilization: 65 },
  { category: 'Bàn ghế', utilization: 90 },
  { category: 'Trang trí', utilization: 54 },
];

export default function Page() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ManagerDashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const loadDashboard = () => {
    return Promise.all([
      reportApiService.getManagerDashboard(),
      orderApiService.getOrders({ limit: 5 }),
      workTaskApiService.getTasks({ limit: 100 }),
      changeRequestApiService.getChangeRequests({ status: 'pending', limit: 5 }),
    ]).then(([dashboardRes, ordersRes, tasksRes, changeRequestsRes]) => {
      setStats(dashboardRes.data);
      setOrders(ordersRes.data);
      setTasks(tasksRes.data);
      setChangeRequests(changeRequestsRes.data);
    });
  };

  useEffect(() => {
    loadDashboard().finally(() => setIsLoading(false));
  }, []);

  const orderById = useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders]);
  const alertedTaskIds = useMemo(
    () => new Set((stats?.alerts ?? []).map((a) => a.workTaskId)),
    [stats]
  );

  const upcomingEvents = orders
    .filter((o) => new Date(o.eventDate) >= new Date())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 4);

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
            <span className="font-medium text-slate-700">{ORDER_STATUS_LABEL[order.status] ?? order.status}</span>.
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

    for (const task of tasks) {
      if (task.status !== 'completed') continue;
      const order = orderById.get(task.orderId);
      feedItems.push({
        key: `task-${task.workTaskId}`,
        time: new Date(task.scheduledStart).getTime(),
        icon: CheckCircle2,
        iconColor: 'green',
        message: (
          <>
            Công việc <span className="font-medium text-slate-700">{humanizeTaskType(task.taskType)}</span> cho đơn{' '}
            <span className="font-medium text-slate-700">#{order?.orderId ?? task.orderId}</span> đã hoàn thành.
          </>
        ),
      });
    }

    return feedItems.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [orders, changeRequests, tasks, orderById]);

  const items: KpiCardItem[] = stats
    ? [
        { label: 'Đơn hàng đang thực hiện', value: stats.ordersInProgress, icon: ClipboardList, iconColor: 'blue' },
        { label: 'Yêu cầu chờ xử lý', value: stats.pendingChangeRequests, icon: RefreshCw, iconColor: 'amber' },
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
      className="min-h-full bg-[#F8FAFC] p-8"
    >
      {/* Section 1 — Greeting + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {greetingForNow()}, {user?.fullName ?? 'Quản lý'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            <span className="capitalize">{todayLabel}</span> · Dưới đây là tổng quan vận hành hôm nay.
          </p>
        </div>
        <Link
          href="/manager/orders"
          className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tạo đơn hàng
        </Link>
      </div>

      {isLoading || !stats ? (
        <p className="mt-8 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {/* Section 2 — KPI Cards */}
          <DashboardStats items={items} />

          {/* Section 3 — Schedule (70%) + Pending Requests (30%) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
            <div className="lg:col-span-7">
              <ScheduleTimeline
                viewDate={viewDate}
                selectedDate={selectedDate}
                onViewDateChange={setViewDate}
                onSelectedDateChange={setSelectedDate}
                tasks={tasks}
                alertedTaskIds={alertedTaskIds}
                orderById={orderById}
                scheduleHref="/manager/schedule/plans"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="border-b border-slate-100 px-5 py-5">
                  <h3 className="text-lg font-semibold text-slate-900">Yêu cầu chờ xử lý</h3>
                  <p className="mt-0.5 text-sm text-slate-400">Cần bạn phê duyệt ({changeRequests.length})</p>
                </div>

                <div className="flex-1 space-y-3 p-4">
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

                <div className="border-t border-slate-100 p-4">
                  <Link
                    href="/manager/field-ops/change-requests"
                    className="flex items-center justify-center rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                  >
                    Xem tất cả yêu cầu
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <ActivityFeed items={activityFeed} />

          {/* Section 4 — Analytics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsCard
              title="Đơn hàng theo tháng"
              subtitle="Xu hướng số lượng đơn hàng"
              isPlaceholder
            >
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ORDERS_TREND_PLACEHOLDER}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Tổng quan doanh thu" subtitle="Triệu VNĐ / tháng" isPlaceholder>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_PLACEHOLDER}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Hiệu suất sử dụng thiết bị" subtitle="% thời gian thiết bị được sử dụng" isPlaceholder>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EQUIPMENT_UTILIZATION_PLACEHOLDER} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Sự kiện sắp tới" subtitle="Đơn hàng có ngày tổ chức gần nhất">
              <div className="flex flex-col gap-3">
                {upcomingEvents.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-400">Không có sự kiện nào sắp tới.</p>
                )}
                {upcomingEvents.map((order) => (
                  <Link
                    key={order.orderId}
                    href={`/manager/orders/${order.orderId}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors duration-150 hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">#{order.orderId}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {order.eventLocation}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium text-slate-500">{formatDate(order.eventDate)}</span>
                  </Link>
                ))}
              </div>
            </AnalyticsCard>
          </div>
        </div>
      )}
    </motion.div>
  );
}
