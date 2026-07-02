'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, ShoppingCart, FileText, Settings2, CheckCircle2, Download } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }));

interface OrderCounts {
  total: number;
  confirmed: number;
  inProgress: number;
  completed: number;
}

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [counts, setCounts] = useState<OrderCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { pagination, setPage, updatePagination } = usePagination(10);

  // Danh sách khách hàng để ghép tên/email vào bảng đơn hàng — GET /orders chỉ trả customerId,
  // không có endpoint lấy nhiều customer theo danh sách id nên lấy 1 trang lớn rồi map ở client
  // (giống pattern orderById ở manager/dashboard).
  useEffect(() => {
    customerApiService.getCustomers({ limit: 100 }).then((res) => setCustomers(res.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    orderApiService
      .getOrders({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
  }, [pagination.currentPage, pagination.limit, debouncedSearch, statusFilter, startDate, endDate]);

  // KPI tổng quan không phụ thuộc bộ lọc bảng — đếm theo status có sẵn trong enum
  // (docs/api/09-orders.md chưa có endpoint thống kê riêng, % tăng/giảm cũng chưa có nguồn
  // dữ liệu nên không hiển thị badge thay đổi thay vì bịa số liệu).
  useEffect(() => {
    Promise.all([
      orderApiService.getOrders({ limit: 1 }),
      orderApiService.getOrders({ limit: 1, status: 'confirmed' }),
      orderApiService.getOrders({ limit: 1, status: 'in_progress' }),
      orderApiService.getOrders({ limit: 1, status: 'completed' }),
    ]).then(([all, confirmed, inProgress, completed]) => {
      setCounts({
        total: all.meta.totalCount,
        confirmed: confirmed.meta.totalCount,
        inProgress: inProgress.meta.totalCount,
        completed: completed.meta.totalCount,
      });
    });
  }, []);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng đơn hàng', value: counts?.total ?? '—', icon: ShoppingCart, iconColor: 'blue' },
    { label: 'Đã xác nhận', value: counts?.confirmed ?? '—', icon: FileText, iconColor: 'amber' },
    { label: 'Đang thực hiện', value: counts?.inProgress ?? '—', icon: Settings2, iconColor: 'blue' },
    { label: 'Đã hoàn thành', value: counts?.completed ?? '—', icon: CheckCircle2, iconColor: 'green' },
  ];

  const handleExportCsv = () => {
    const header = ['Mã đơn hàng', 'Khách hàng', 'Địa điểm', 'Ngày tổ chức', 'Trạng thái'];
    const rows = orders.map((o) => {
      const customer = customerById.get(o.customerId);
      return [
        o.orderNumber,
        customer?.fullName ?? o.customerId,
        o.venueAddress,
        formatDate(o.eventStartDate),
        ORDER_STATUS_LABEL[o.status] ?? o.status,
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
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
      key: 'orderNumber',
      label: 'Mã đơn hàng',
      render: (row) => (
        <Link href={`/manager/orders/${row.orderId}`} className="font-medium text-blue-600 hover:underline">
          #{row.orderNumber}
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
            <Avatar name={customer?.fullName ?? row.customerId} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-700">{customer?.fullName ?? `KH #${row.customerId}`}</p>
              {customer?.email && <p className="truncate text-xs text-slate-400">{customer.email}</p>}
            </div>
          </div>
        );
      },
    },
    { key: 'venueAddress', label: 'Địa điểm tổ chức' },
    {
      key: 'eventStartDate',
      label: 'Ngày tổ chức',
      render: (row) => formatDate(row.eventStartDate),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>{ORDER_STATUS_LABEL[row.status] ?? row.status}</Badge>
      ),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quản lý đơn hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và điều phối tất cả các đơn hàng sự kiện trong hệ thống.</p>
        </div>
        <Link href="/manager/orders/create">
          <Button>
            <Plus className="h-4 w-4" />
            Tạo đơn hàng mới
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <DashboardStats items={kpiItems} />
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Tìm theo mã đơn hàng..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-44">
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
          <div className="w-44">
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
          <Button variant="secondary" onClick={handleExportCsv} disabled={orders.length === 0}>
            <Download className="h-4 w-4" />
            Xuất file
          </Button>
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={orders} rowKey={(row) => row.orderId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
