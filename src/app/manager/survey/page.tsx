'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, MapPin, User, Search, ClipboardList, FileCheck2, Clock } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { surveyApiService } from '@/services/survey.service';
import { schedulePlanApiService } from '@/services/schedulePlan.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import SurveyReportDrawer, { SurveyRow } from '@/components/survey/SurveyReportDrawer';
import { formatDate } from '@/utils/formatDate';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { SchedulePlan } from '@/types/schedulePlan';

// ---------------------------------------------------------------------------
// Backend không có endpoint liệt kê báo cáo khảo sát toàn hệ thống — trang này quét từng trang
// đơn hàng (GET /orders) rồi gọi song song GET /orders/:orderId/survey-reports (báo cáo, nếu có) +
// GET /schedule-plans?orderId= (lịch khảo sát, để biết ai phụ trách + ngày dự kiến khi chưa nộp
// báo cáo). Tất cả field hiển thị đều là dữ liệu thật — không còn mock ngày/tiến độ như trước.
// ---------------------------------------------------------------------------

const ORDER_BATCH_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'submitted', label: 'Đã nộp báo cáo' },
  { value: 'pending', label: 'Chưa nộp báo cáo' },
];

function isSurveyPlan(plan: SchedulePlan): boolean {
  return plan.taskName?.toLowerCase().includes('khảo sát') ?? false;
}

function computeRowState(row: SurveyRow): 'submitted' | 'pending' {
  return row.report ? 'submitted' : 'pending';
}

async function fetchSurveyRowsForOrder(order: Order, customerById: Map<string, Customer>): Promise<SurveyRow | null> {
  const [reportsRes, plansRes] = await Promise.all([
    surveyApiService.getOrderSurveyReports(order.orderId).catch(() => ({ data: [] })),
    schedulePlanApiService.getSchedulePlans({ orderId: order.orderId }).catch(() => ({ data: [] })),
  ]);
  const reports = reportsRes.data ?? [];
  const plans: SchedulePlan[] = (plansRes.data ?? []).filter(isSurveyPlan);
  if (reports.length === 0 && plans.length === 0) return null;

  return {
    orderId: order.orderId,
    plan: plans[0] ?? null,
    order,
    customer: customerById.get(order.customerId),
    report: reports[0] ?? null,
  };
}

export default function Page() {
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(0);
  const [ordersTotalCount, setOrdersTotalCount] = useState<number | null>(null);
  const [currentOrderPage, setCurrentOrderPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeRow, setActiveRow] = useState<SurveyRow | null>(null);

  useEffect(() => {
    customerApiService.getCustomers({ limit: 200 }).then((res) => setCustomers(res.data ?? []));
  }, []);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const loadOrderPage = async (page: number) => {
    const ordersRes = await orderApiService.getOrders({ page, limit: ORDER_BATCH_SIZE });
    const orders: Order[] = ordersRes.data ?? [];
    setOrdersTotalCount(ordersRes.meta?.totalCount ?? 0);
    const perOrder = await Promise.all(orders.map((o) => fetchSurveyRowsForOrder(o, customerById)));
    setRows((prev) => [...prev, ...perOrder.filter((r): r is SurveyRow => r !== null)]);
    setOrdersLoaded((prev) => prev + orders.length);
    setCurrentOrderPage(page);
  };

  const hasLoadedInitialPage = useRef(false);
  useEffect(() => {
    if (hasLoadedInitialPage.current) return;
    hasLoadedInitialPage.current = true;
    loadOrderPage(1).finally(() => setIsInitialLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await loadOrderPage(currentOrderPage + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const state = computeRowState(row);
      if (statusFilter && state !== statusFilter) return false;
      if (!term) return true;
      return (
        row.orderId.toLowerCase().includes(term) ||
        (row.customer?.customerName?.toLowerCase().includes(term) ?? false) ||
        (row.order?.location?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [rows, searchTerm, statusFilter]);

  const submittedCount = rows.filter((r) => computeRowState(r) === 'submitted').length;
  const pendingCount = rows.filter((r) => computeRowState(r) === 'pending').length;

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng khảo sát', value: rows.length, icon: ClipboardList, iconColor: 'blue' },
    { label: 'Đã nộp báo cáo', value: submittedCount, icon: FileCheck2, iconColor: 'green' },
    { label: 'Chưa nộp báo cáo', value: pendingCount, icon: Clock, iconColor: 'amber' },
  ];

  const hasMoreOrders = ordersTotalCount !== null && ordersLoaded < ordersTotalCount;

  const columns: TableColumn<SurveyRow>[] = [
    {
      key: 'orderId',
      label: 'Mã đơn',
      render: (row) => (
        <Link href={`/manager/orders/${row.orderId}`} className="font-mono text-sm font-semibold text-blue-600 hover:underline">
          {row.order?.orderCode ?? `#${row.orderId}`}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.customer?.customerName ?? String(row.order?.customerId ?? '?')} size="sm" />
          <span className="truncate font-medium text-slate-700">{row.customer?.customerName ?? `KH #${row.order?.customerId ?? '—'}`}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Địa điểm sảnh khảo sát',
      render: (row) => (
        <span className="flex max-w-[200px] items-center gap-1 truncate text-sm text-slate-600" title={row.order?.location}>
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          {row.order?.location ?? '—'}
        </span>
      ),
    },
    {
      key: 'surveyDate',
      label: 'Ngày khảo sát',
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-slate-500">
          {row.report ? formatDate(row.report.surveyDate) : row.plan ? formatDate(row.plan.startTime) : '—'}
        </span>
      ),
    },
    {
      key: 'surveyor',
      label: 'Nhân sự thực hiện',
      render: (row) =>
        row.plan?.assigneeName ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <User className="h-3.5 w-3.5 text-slate-400" />
            {row.plan.assigneeName}
          </span>
        ) : (
          <span className="text-sm italic text-slate-400">Chưa phân công</span>
        ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      className: 'whitespace-nowrap',
      render: (row) => {
        const state = computeRowState(row);
        return state === 'submitted' ? <Badge variant="success">Đã nộp</Badge> : <Badge variant="warning">Chờ nộp</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Xem báo cáo',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setActiveRow(row)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem báo cáo
        </button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Theo dõi khảo sát hiện trường</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý tiến độ khảo sát và báo cáo hiện trường theo từng đơn hàng.</p>
      </div>

      <div className="mt-6">
        <DashboardStats items={kpiItems} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng hoặc địa điểm..."
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_FILTER_OPTIONS} />
          </div>
        </div>
        <p className="mt-3 text-xs italic text-slate-400">
          Đã tải từ {ordersLoaded}/{ordersTotalCount ?? '…'} đơn hàng.
        </p>
      </motion.div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table columns={columns} rows={filteredRows} rowKey={(row) => row.orderId} isLoading={isInitialLoading} emptyText="Không có khảo sát nào phù hợp." />
        </div>

        {hasMoreOrders && (
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoadingMore}>
              Tải thêm đơn hàng ({ordersLoaded}/{ordersTotalCount})
            </Button>
          </div>
        )}
      </div>

      <SurveyReportDrawer row={activeRow} onClose={() => setActiveRow(null)} />
    </div>
  );
}
