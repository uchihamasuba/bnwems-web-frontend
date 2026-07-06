'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, MapPin, User, Search, ClipboardList, FileCheck2, Clock, AlertTriangle } from 'lucide-react';
import { workTaskApiService } from '@/services/workTask.service';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { surveyApiService } from '@/services/survey.service';
import { assignmentApiService } from '@/services/assignment.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import SurveyReportDrawer, { SurveyRow } from '@/components/survey/SurveyReportDrawer';
import { formatDate } from '@/utils/formatDate';
import type { WorkTask } from '@/types/workTask';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

// ---------------------------------------------------------------------------
// Backend không có endpoint liệt kê báo cáo khảo sát riêng — trang này gom TẤT CẢ WorkTask thật
// (GET /tasks, UC 2.14) rồi tự lọc taskCategory === 'survey' phía client. Không dùng query param
// `taskType` — backend lọc nhầm theo cột `title` tự do (docs/more-require.md mục bb).
// getOrderAssignments là MOCK-ONLY (mục n) — surveyorName có thể trống nếu Manager chưa phân công
// KSV qua tab "Khảo sát & Nhân sự" của đơn hàng.
// SurveyReport thật (types/survey.ts) không có measurements/proposedItems như prototype mock —
// phần chi tiết (SurveyReportDrawer) chỉ hiển thị đúng field thật: ghi chú, ảnh, người nộp.
// "Ngày khảo sát" là MOCK (WorkTask không có cột ngày dự kiến thật, xem mục bb) — luôn in nghiêng.
// ---------------------------------------------------------------------------

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'submitted', label: 'Đã nộp báo cáo' },
  { value: 'pending', label: 'Chưa nộp báo cáo' },
  { value: 'overdue', label: 'Quá hạn' },
];

/** MOCK — WorkTask thật không có ngày khảo sát dự kiến (xem docs/more-require.md mục bb). Suy ra
 * quyết định từ createdAt (+2 ngày) để ổn định qua các lần tải lại, KHÔNG phải dữ liệu thật. */
function mockSurveyDateFor(task: WorkTask): string {
  const base = new Date(task.createdAt);
  base.setDate(base.getDate() + 2);
  return base.toISOString();
}

function computeRowState(row: SurveyRow): 'submitted' | 'overdue' | 'pending' {
  if (row.report) return 'submitted';
  return new Date(row.mockSurveyDate) < new Date() ? 'overdue' : 'pending';
}

function fetchReportOrNull(task: WorkTask) {
  return surveyApiService
    .getSurveyReport(task.workTaskId)
    .then((r) => r.data)
    .catch(() => null);
}

function fetchAssignmentsEntry(orderId: string) {
  return assignmentApiService
    .getOrderAssignments(orderId)
    .then((r) => [orderId, r.data] as const)
    .catch(() => [orderId, null] as const);
}

async function loadSurveyRows(): Promise<SurveyRow[]> {
  const [tasksRes, ordersRes, customersRes] = await Promise.all([
    workTaskApiService.getTasks({ limit: 200 }),
    orderApiService.getOrders({ limit: 200 }),
    customerApiService.getCustomers({ limit: 200 }),
  ]);
  const allTasks: WorkTask[] = tasksRes.data ?? [];
  const tasks = allTasks.filter((t) => t.taskCategory === 'survey');
  const orders: Order[] = ordersRes.data ?? [];
  const customers: Customer[] = customersRes.data ?? [];
  const orderById = new Map(orders.map((o) => [o.orderId, o]));
  const customerById = new Map(customers.map((c) => [c.customerId, c]));
  const uniqueOrderIds = [...new Set(tasks.map((t) => t.orderId))];

  const [reports, assignmentEntries] = await Promise.all([
    Promise.all(tasks.map(fetchReportOrNull)),
    Promise.all(uniqueOrderIds.map(fetchAssignmentsEntry)),
  ]);
  const assignmentByOrderId = new Map(assignmentEntries);

  return tasks.map((task, idx) => {
    const order = orderById.get(task.orderId);
    const assignments = assignmentByOrderId.get(task.orderId);
    return {
      task,
      order,
      customer: order ? customerById.get(order.customerId) : undefined,
      report: reports[idx],
      surveyorName: assignments?.survey?.members[0]?.fullName,
      mockSurveyDate: mockSurveyDateFor(task),
    };
  });
}

export default function Page() {
  const [rows, setRows] = useState<SurveyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeRow, setActiveRow] = useState<SurveyRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    loadSurveyRows().then((result) => {
      if (cancelled) return;
      setRows(result);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((row) => {
      const state = computeRowState(row);
      if (statusFilter && state !== statusFilter) return false;
      if (!term) return true;
      return (
        row.task.orderId.toLowerCase().includes(term) ||
        (row.customer?.fullName?.toLowerCase().includes(term) ?? false) ||
        (row.order?.eventLocation?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [rows, searchTerm, statusFilter]);

  const submittedCount = rows.filter((r) => computeRowState(r) === 'submitted').length;
  const pendingCount = rows.filter((r) => computeRowState(r) === 'pending').length;
  const overdueCount = rows.filter((r) => computeRowState(r) === 'overdue').length;

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng khảo sát', value: rows.length, icon: ClipboardList, iconColor: 'blue' },
    { label: 'Đã nộp báo cáo', value: submittedCount, icon: FileCheck2, iconColor: 'green' },
    { label: 'Chưa nộp báo cáo', value: pendingCount, icon: Clock, iconColor: 'amber' },
    { label: 'Quá hạn', value: overdueCount, icon: AlertTriangle, iconColor: overdueCount > 0 ? 'red' : 'green' },
  ];

  const columns: TableColumn<SurveyRow>[] = [
    {
      key: 'orderId',
      label: 'Mã đơn',
      render: (row) => (
        <Link href={`/manager/orders/${row.task.orderId}`} className="font-mono text-sm font-semibold text-blue-600 hover:underline">
          #{row.task.orderId}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.customer?.fullName ?? String(row.order?.customerId ?? '?')} size="sm" />
          <span className="truncate font-medium text-slate-700">{row.customer?.fullName ?? `KH #${row.order?.customerId ?? '—'}`}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Địa điểm khảo sát',
      render: (row) => (
        <span className="flex max-w-[200px] items-center gap-1 truncate text-sm text-slate-600" title={row.order?.eventLocation}>
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          {row.order?.eventLocation ?? '—'}
        </span>
      ),
    },
    {
      key: 'mockSurveyDate',
      label: 'Ngày khảo sát',
      render: (row) => (
        <span
          className="whitespace-nowrap text-sm italic text-slate-500"
          title="Dữ liệu minh họa — chưa có API ngày khảo sát thật"
        >
          {formatDate(row.mockSurveyDate)}
        </span>
      ),
    },
    {
      key: 'surveyor',
      label: 'Nhân sự thực hiện',
      render: (row) =>
        row.surveyorName ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <User className="h-3.5 w-3.5 text-slate-400" />
            {row.surveyorName}
          </span>
        ) : (
          <span className="text-sm italic text-slate-400">Chưa phân công</span>
        ),
    },
    {
      key: 'status',
      label: 'Báo cáo',
      className: 'whitespace-nowrap',
      render: (row) => {
        const state = computeRowState(row);
        if (state === 'submitted') return <Badge variant="success">Đã nộp</Badge>;
        if (state === 'overdue') return <Badge variant="error">Quá hạn</Badge>;
        return <Badge variant="warning">Chưa nộp</Badge>;
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
      </motion.div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            rows={filteredRows}
            rowKey={(row) => row.task.workTaskId}
            isLoading={isLoading}
            emptyText="Không có khảo sát nào phù hợp."
          />
        </div>
      </div>

      <SurveyReportDrawer row={activeRow} onClose={() => setActiveRow(null)} />
    </div>
  );
}
