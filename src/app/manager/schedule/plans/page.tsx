'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, RefreshCw, Calendar, List, Layers, Pencil, Trash2 } from 'lucide-react';
import { workTaskApiService } from '@/services/workTask.service';
import { schedulePlanApiService } from '@/services/schedulePlan.service';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { assignmentApiService } from '@/services/assignment.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import CalendarView from '@/components/schedule/CalendarView';
import WeekView from '@/components/schedule/WeekView';
import TaskKanbanBoard from '@/components/schedule/TaskKanbanBoard';
import CreateTaskModal from '@/components/schedule/CreateTaskModal';
import EditTaskModal from '@/components/schedule/EditTaskModal';
import { TASK_CATEGORY_LABEL, TASK_STATUS_LABEL } from '@/constants/work-task';
import { formatDate, formatTime } from '@/utils/formatDate';
import type { WorkTask } from '@/types/workTask';
import type { Schedule } from '@/types/schedulePlan';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { OrderAssignments } from '@/types/assignment';

type SubTab = 'calendar' | 'plans' | 'tasks';
type CalendarMode = 'month' | 'week' | 'day';

async function loadScheduleData() {
  const [tasksRes, ordersRes, customersRes, schedulesRes] = await Promise.all([
    workTaskApiService.getTasks({ limit: 200 }),
    orderApiService.getOrders({ limit: 200 }),
    customerApiService.getCustomers({ limit: 200 }),
    schedulePlanApiService.getSchedules({ limit: 200 }),
  ]);
  return {
    tasks: (tasksRes.data ?? []) as WorkTask[],
    orders: (ordersRes.data ?? []) as Order[],
    customers: (customersRes.data ?? []) as Customer[],
    schedules: schedulesRes.data ?? [],
  };
}

async function fetchAssignment(orderId: string): Promise<[string, OrderAssignments | null]> {
  return assignmentApiService
    .getOrderAssignments(orderId)
    .then((res) => [orderId, res.data] as const)
    .catch(() => [orderId, null] as const);
}

function calendarModeLabel(mode: CalendarMode): string {
  if (mode === 'month') return 'Tháng';
  if (mode === 'week') return 'Tuần';
  return 'Ngày';
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function statusBadgeVariant(status: string): 'success' | 'info' | 'neutral' {
  if (status === 'done') return 'success';
  if (status === 'in_progress') return 'info';
  return 'neutral';
}

const SUB_TABS: { id: SubTab; label: string; icon: typeof Calendar }[] = [
  { id: 'calendar', label: 'Lịch đơn hàng (Calendar)', icon: Calendar },
  { id: 'plans', label: 'Kế hoạch lịch trình', icon: List },
  { id: 'tasks', label: 'Công việc nhân sự (Kanban)', icon: Layers },
];

export default function Page() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('calendar');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');

  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [assignmentByOrderId, setAssignmentByOrderId] = useState<Map<string, OrderAssignments | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const refresh = () =>
    loadScheduleData().then(async ({ tasks: t, orders: o, customers: c, schedules: sc }) => {
      setTasks(t);
      setOrders(o);
      setCustomers(c);
      setSchedules(sc);
      const uniqueOrderIds = [...new Set(t.map((task) => task.orderId))];
      const entries = await Promise.all(uniqueOrderIds.map(fetchAssignment));
      setAssignmentByOrderId(new Map(entries));
    });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, []);

  const orderById = useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders]);
  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  };

  const schedulesOnSelectedDate = schedules.filter((s) => isSameDay(new Date(s.scheduledStart), selectedDate));

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (categoryFilter && t.taskCategory !== categoryFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        if (!term) return true;
        const order = orderById.get(t.orderId);
        const customerName = order ? (customerById.get(order.customerId)?.fullName ?? '') : '';
        return t.orderId.toLowerCase().includes(term) || t.title.toLowerCase().includes(term) || customerName.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, searchTerm, categoryFilter, statusFilter, orderById, customerById]);

  const filteredSchedules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return schedules
      .filter((s) => {
        if (categoryFilter === 'survey' && s.activityType !== 'survey') return false;
        if (categoryFilter === 'operation' && s.activityType === 'survey') return false;
        if (statusFilter && s.status !== statusFilter) return false;
        if (!term) return true;
        const order = orderById.get(s.orderId);
        const customerName = order ? (customerById.get(order.customerId)?.fullName ?? '') : '';
        return s.orderId.toLowerCase().includes(term) || s.activityType.toLowerCase().includes(term) || customerName.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }, [schedules, searchTerm, categoryFilter, statusFilter, orderById, customerById]);

  const handleDeletePlan = async (task: WorkTask) => {
    if (task.status !== 'draft') return;
    if (!confirm(`Xóa kế hoạch "${task.title}" khỏi hệ thống?`)) return;
    await workTaskApiService.cancelTask(task.workTaskId, 'deleted');
    await refresh();
  };

  const planColumns: TableColumn<WorkTask>[] = [
    {
      key: 'workTaskId',
      label: 'Mã lịch',
      render: (task) => <span className="font-mono text-sm font-semibold text-blue-600">#{task.workTaskId}</span>,
    },
    {
      key: 'orderId',
      label: 'Hợp đồng',
      render: (task) => (
        <Link href={`/manager/orders/${task.orderId}`} className="font-mono text-sm text-blue-600 hover:underline">
          #{task.orderId}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (task) => {
        const order = orderById.get(task.orderId);
        const customer = order ? customerById.get(order.customerId) : undefined;
        return <span className="font-medium text-slate-700">{customer?.fullName ?? `KH #${order?.customerId ?? '—'}`}</span>;
      },
    },
    {
      key: 'taskCategory',
      label: 'Phân loại',
      render: (task) => <Badge variant={task.taskCategory === 'survey' ? 'info' : 'neutral'}>{TASK_CATEGORY_LABEL[task.taskCategory]}</Badge>,
    },
    {
      key: 'title',
      label: 'Công việc',
      render: (task) => <span className="text-sm text-slate-700">{task.title}</span>,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (task) => (
        <span className="whitespace-nowrap text-sm text-slate-500">
          {formatDate(task.createdAt)} {formatTime(task.createdAt)}
        </span>
      ),
    },
    {
      key: 'staff',
      label: 'Staff phụ trách',
      render: (task) => {
        const assignments = assignmentByOrderId.get(task.orderId);
        const group = task.taskCategory === 'survey' ? assignments?.survey : assignments?.execution;
        const name = group?.members[0]?.fullName;
        return name ? <span className="text-sm text-slate-700">{name}</span> : <span className="text-sm italic text-slate-400">Chưa phân công</span>;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      className: 'whitespace-nowrap',
      render: (task) => <Badge variant={statusBadgeVariant(task.status)}>{TASK_STATUS_LABEL[task.status]}</Badge>,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      className: 'text-right',
      render: (task) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            disabled={task.status !== 'draft'}
            onClick={() => setEditingTask(task)}
            title={task.status === 'draft' ? 'Sửa kế hoạch' : 'Chỉ sửa được khi còn nháp'}
            className="rounded-md p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={task.status !== 'draft'}
            onClick={() => handleDeletePlan(task)}
            title={task.status === 'draft' ? 'Xóa kế hoạch' : 'Chỉ xóa được khi còn nháp'}
            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Thanh chuyển tab chính, giống prototype */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeSubTab === 'plans' && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Tạo kế hoạch
          </button>
        )}
        {activeSubTab === 'tasks' && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Giao Task mới
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-6">
          {/* SUB TAB 1: CALENDAR */}
          {activeSubTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900">Lịch trình công việc</h2>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">Quản lý nhiệm vụ và thời gian biểu của bạn</p>
                </div>
                <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
                  {(['month', 'week', 'day'] as CalendarMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCalendarMode(mode)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-extrabold transition-all ${
                        calendarMode === mode ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {calendarModeLabel(mode)}
                    </button>
                  ))}
                </div>
              </div>

              {calendarMode === 'week' ? (
                <WeekView
                  anchorDate={viewDate}
                  onAnchorDateChange={setViewDate}
                  selectedDate={selectedDate}
                  onSelectedDateChange={setSelectedDate}
                  schedules={schedules}
                  orderById={orderById}
                  customerById={customerById}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="relative min-w-[240px] flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm mã đơn, khách hàng, công việc..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        options={[{ value: '', label: 'Tất cả loại' }, { value: 'survey', label: 'Khảo sát' }, { value: 'operation', label: 'Vận hành thi công' }]}
                      />
                    </div>
                    <div className="w-48">
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                          { value: '', label: 'Trạng thái công việc' },
                          { value: 'draft', label: 'Nháp' },
                          { value: 'assigned', label: 'Đã giao việc' },
                          { value: 'in_progress', label: 'Đang thực hiện' },
                          { value: 'done', label: 'Hoàn thành' },
                        ]}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Đặt lại
                    </button>
                  </div>

                  {calendarMode === 'month' ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      <div className="lg:col-span-8">
                        <CalendarView viewDate={viewDate} selectedDate={selectedDate} onViewDateChange={setViewDate} onSelectedDateChange={setSelectedDate} schedules={filteredSchedules} />
                      </div>
                      <div className="lg:col-span-4">
                        <DaySidebar selectedDate={selectedDate} schedules={schedulesOnSelectedDate} orderById={orderById} customerById={customerById} />
                      </div>
                    </div>
                  ) : (
                    <DaySidebar selectedDate={selectedDate} schedules={schedulesOnSelectedDate} orderById={orderById} customerById={customerById} fullWidth />
                  )}
                </>
              )}
            </div>
          )}

          {/* SUB TAB 2: PLANS LIST */}
          {activeSubTab === 'plans' && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="overflow-x-auto">
                <Table columns={planColumns} rows={filteredTasks} rowKey={(t) => t.workTaskId} emptyText="Chưa có kế hoạch/công việc nào." />
              </div>
            </div>
          )}

          {/* SUB TAB 3: KANBAN */}
          {activeSubTab === 'tasks' && (
            <TaskKanbanBoard tasks={tasks} orderById={orderById} customerById={customerById} onRefresh={refresh} />
          )}
        </div>
      )}

      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={refresh} />
      <EditTaskModal isOpen={Boolean(editingTask)} task={editingTask} onClose={() => setEditingTask(null)} onUpdated={refresh} />
    </div>
  );
}

interface DaySidebarProps {
  selectedDate: Date;
  schedules: Schedule[];
  orderById: Map<string, Order>;
  customerById: Map<string, Customer>;
  fullWidth?: boolean;
}

function DaySidebar({ selectedDate, schedules, orderById, customerById, fullWidth }: Readonly<DaySidebarProps>) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs ${fullWidth ? '' : 'sticky top-6'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold capitalize text-slate-900">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </h3>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">{schedules.length} sự kiện</span>
      </div>
      <div className="mt-3 space-y-3">
        {schedules.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">Không có lịch trình nào trong ngày này.</p>
        ) : (
          schedules.map((schedule) => {
            const order = orderById.get(schedule.orderId);
            const customer = order ? customerById.get(order.customerId) : undefined;
            return (
              <div key={schedule.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{schedule.activityType}</p>
                  <Badge variant={statusBadgeVariant(schedule.status)}>{TASK_STATUS_LABEL[schedule.status]}</Badge>
                </div>
                <Link href={`/manager/orders/${schedule.orderId}`} className="mt-1 block text-xs font-medium text-blue-600 hover:underline">
                  #{schedule.orderId} — {customer?.fullName ?? `KH #${order?.customerId ?? '—'}`}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
