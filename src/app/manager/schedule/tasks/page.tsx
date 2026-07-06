'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, ListChecks, Loader2, CircleDashed } from 'lucide-react';
import { schedulePlanApiService } from '@/services/schedulePlan.service';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import CreateTaskModal from '@/components/schedule/CreateTaskModal';
import TaskKanbanBoard from '@/components/schedule/TaskKanbanBoard';
import type { SchedulePlan } from '@/types/schedulePlan';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

async function loadBoardData() {
  const [plansRes, ordersRes, customersRes] = await Promise.all([
    schedulePlanApiService.getSchedulePlans({ limit: 200 }),
    orderApiService.getOrders({ limit: 200 }),
    customerApiService.getCustomers({ limit: 200 }),
  ]);
  return {
    plans: (plansRes.data ?? []) as SchedulePlan[],
    orders: (ordersRes.data ?? []) as Order[],
    customers: (customersRes.data ?? []) as Customer[],
  };
}

export default function Page() {
  const [plans, setPlans] = useState<SchedulePlan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const refresh = () =>
    loadBoardData().then(({ plans: p, orders: o, customers: c }) => {
      setPlans(p);
      setOrders(o);
      setCustomers(c);
    });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    refresh().finally(() => setIsLoading(false));
  }, []);

  const orderById = useMemo(() => new Map(orders.map((o) => [o.orderId, o])), [orders]);
  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng kế hoạch', value: plans.length, icon: ClipboardList, iconColor: 'blue' },
    { label: 'Chờ xử lý', value: plans.filter((p) => p.status === 'PENDING').length, icon: CircleDashed, iconColor: 'amber' },
    { label: 'Đang thực hiện', value: plans.filter((p) => p.status === 'IN_PROGRESS').length, icon: Loader2, iconColor: 'blue' },
    { label: 'Hoàn thành', value: plans.filter((p) => p.status === 'COMPLETED').length, icon: ListChecks, iconColor: 'green' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Giao việc cho nhân sự</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và điều phối công việc khảo sát/vận hành theo trạng thái.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Tạo công việc mới
        </button>
      </div>

      <div className="mt-6">
        <DashboardStats items={kpiItems} />
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-slate-400">Đang tải...</p>
      ) : (
        <div className="mt-6">
          <TaskKanbanBoard plans={plans} orderById={orderById} customerById={customerById} onRefresh={refresh} />
        </div>
      )}

      <CreateTaskModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={refresh} />
    </div>
  );
}
