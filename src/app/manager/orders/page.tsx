'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  ShoppingCart,
  Inbox,
  Settings2,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
} from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import CreateOrderModal from '@/components/orders/CreateOrderModal';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';
import { EVENT_TYPES } from '@/constants/order-event-type';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

// ---------------------------------------------------------------------------
// MOCK helpers — chỉ dùng làm fallback cho order chưa có field thật (tạo trước khi backend bổ
// sung cột, hoặc để trống lúc tạo). Xem docs/more-require.md mục t, u, s, v.
// ---------------------------------------------------------------------------

function mockOrderNumber(order: Order): string {
  if (order.orderNumber) return order.orderNumber;
  const year = new Date(order.createdAt).getFullYear();
  return `ORD-${year}-${String(order.orderId).padStart(4, '0')}`;
}

function mockEventType(order: Order): string {
  if (order.eventType) return order.eventType;
  return EVENT_TYPES[parseInt(order.orderId) % EVENT_TYPES.length];
}

function mockEventEndDate(order: Order): string {
  if (order.eventEndDate) return order.eventEndDate;
  const d = new Date(order.eventDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }));

interface OrderCounts {
  total: number;
  newDraft: number;
  inProgress: number;
  completed: number;
}

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [counts, setCounts] = useState<OrderCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // searchValue chỉ controlled — chưa gửi lên API vì backend chưa có cột orderNumber
  // (xem more-require.md mục t). Bỏ disabled và truyền search param khi backend implement.
  const [searchValue, setSearchValue] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { pagination, setPage, updatePagination } = usePagination(10);

  // Danh sách khách hàng để ghép tên/phone vào bảng — GET /orders chỉ trả customerId,
  // không có endpoint lấy nhiều customer theo id nên lấy 1 trang lớn rồi map ở client.
  useEffect(() => {
    customerApiService.getCustomers({ limit: 100 }).then((res) => setCustomers(res.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    orderApiService
      .getOrders({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        // search: searchValue || undefined, // bật lại khi backend có cột orderNumber (mục t)
      })
      .then((res) => {
        setOrders(res.data);
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, statusFilter, startDate, endDate, refreshKey]);

  // KPI — đếm riêng theo status, không phụ thuộc bộ lọc bảng
  useEffect(() => {
    Promise.all([
      orderApiService.getOrders({ limit: 1 }),
      orderApiService.getOrders({ limit: 1, status: 'draft' }),
      orderApiService.getOrders({ limit: 1, status: 'in_progress' }),
      orderApiService.getOrders({ limit: 1, status: 'completed' }),
    ]).then(([all, newDraft, inProgress, completed]) => {
      setCounts({
        total: all.meta.totalCount,
        newDraft: newDraft.meta.totalCount,
        inProgress: inProgress.meta.totalCount,
        completed: completed.meta.totalCount,
      });
    });
  }, []);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng đơn hàng', value: counts?.total ?? '—', icon: ShoppingCart, iconColor: 'blue' },
    { label: 'Đơn mới', value: counts?.newDraft ?? '—', icon: Inbox, iconColor: 'blue' },
    { label: 'Đang thực hiện', value: counts?.inProgress ?? '—', icon: Settings2, iconColor: 'amber' },
    { label: 'Đã hoàn thành', value: counts?.completed ?? '—', icon: CheckCircle2, iconColor: 'green' },
  ];

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setPage(1);
  };

  const handleExportCsv = () => {
    const header = [
      'Mã đơn hàng',
      'Khách hàng',
      'SĐT',
      'Loại sự kiện',
      'Ngày tổ chức',
      'Ngày kết thúc',
      'Địa chỉ',
      'Trạng thái',
      'Ngày tạo',
    ];
    const rows = orders.map((o) => {
      const customer = customerById.get(o.customerId);
      return [
        mockOrderNumber(o),
        customer?.fullName ?? `KH #${o.customerId}`,
        customer?.phone ?? '',
        mockEventType(o),
        formatDate(o.eventDate),
        formatDate(mockEventEndDate(o)),
        o.eventLocation,
        ORDER_STATUS_LABEL[o.status] ?? o.status,
        formatDate(o.createdAt),
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `don-hang-trang-${pagination.currentPage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderId',
      label: 'Mã đơn hàng',
      render: (row) => (
        <Link
          href={`/manager/orders/${row.orderId}`}
          className="font-mono text-sm font-medium text-blue-600 hover:underline"
        >
          {mockOrderNumber(row)}
        </Link>
      ),
    },
    {
      key: 'customerId',
      label: 'Khách hàng',
      render: (row) => {
        const customer = customerById.get(row.customerId);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={customer?.fullName ?? String(row.customerId)} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-700">{customer?.fullName ?? `KH #${row.customerId}`}</p>
              {customer?.phone && <p className="truncate text-xs text-slate-400">{customer.phone}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'eventType',
      label: 'Loại sự kiện',
      render: (row) => (
        // in nghiêng chỉ khi order chưa có eventType thật (order cũ hoặc để trống lúc tạo)
        <span className={`text-sm font-medium text-indigo-600 ${row.eventType ? '' : 'italic text-slate-400'}`}>
          {mockEventType(row)}
        </span>
      ),
    },
    {
      key: 'eventDate',
      label: 'Ngày tổ chức',
      render: (row) => <span className="whitespace-nowrap text-sm">{formatDate(row.eventDate)}</span>,
    },
    {
      key: 'eventEndDate',
      label: 'Ngày kết thúc',
      render: (row) => (
        // in nghiêng chỉ khi order chưa có eventEndDate thật (order cũ hoặc để trống lúc tạo)
        <span className={`whitespace-nowrap text-sm ${row.eventEndDate ? 'text-slate-600' : 'italic text-slate-400'}`}>
          {formatDate(mockEventEndDate(row))}
        </span>
      ),
    },
    {
      key: 'eventLocation',
      label: 'Địa chỉ',
      render: (row) => (
        <span className="max-w-[180px] truncate text-sm text-slate-600" title={row.eventLocation}>
          {row.eventLocation}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      className: 'whitespace-nowrap',
      render: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => <span className="whitespace-nowrap text-sm text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <Link
          href={`/manager/orders/${row.orderId}`}
          aria-label="Xem chi tiết"
          title="Xem chi tiết"
          className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
        >
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và điều phối tất cả các đơn hàng sự kiện trong hệ thống.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tạo đơn hàng mới
        </Button>
      </div>

      {/* KPI */}
      <div className="mt-6">
        <DashboardStats items={kpiItems} />
      </div>

      {/* Filter bar */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search — disabled cho đến khi backend có cột orderNumber (more-require.md mục t) */}
          <div className="relative w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm theo mã đơn hàng..."
              disabled
              title="Tính năng đang phát triển — backend chưa có cột orderNumber"
              className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-400 outline-none"
            />
          </div>

          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]}
            />
          </div>

          <div className="w-40">
            <Input
              type="date"
              label="Từ ngày"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              label="Đến ngày"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="secondary" onClick={handleRefresh} title="Tải lại dữ liệu">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
            <Button variant="secondary" onClick={handleExportCsv} disabled={orders.length === 0}>
              <Download className="h-4 w-4" />
              Xuất file
            </Button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table columns={columns} rows={orders} rowKey={(row) => row.orderId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <CreateOrderModal
        isOpen={isCreateOpen}
        customers={customers}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
