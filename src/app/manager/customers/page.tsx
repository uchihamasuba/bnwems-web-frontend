'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Eye, Pencil, Plus, Search } from 'lucide-react';
import { customerApiService } from '@/services/customer.service';
import { orderApiService } from '@/services/order.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CustomerFormModal, CustomerFormValues } from '@/components/customers/CustomerFormModal';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateLong } from '@/utils/formatDate';
import { maskPhone } from '@/utils/formatPhone';
import type { Customer } from '@/types/customer';
import type { Order } from '@/types/order';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
];

function truncateText(value: string, maxLength = 28): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('');

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; customer: Customer | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const refetchCustomers = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    orderApiService.getOrders({ limit: 200 }).then((res) => setOrders(res.data));
  }, [refreshToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    customerApiService
      .getCustomers({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
      })
      .then((res) => {
        setCustomers(res.data);
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, debouncedSearch, refreshToken]);

  const orderCountByCustomer = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      counts.set(order.customerId, (counts.get(order.customerId) ?? 0) + 1);
    });
    return counts;
  }, [orders]);

  const displayedCustomers = useMemo(() => {
    if (!statusFilter) return customers;
    return customers.filter((customer) => {
      const hasOrders = (orderCountByCustomer.get(customer.customerId) ?? 0) > 0;
      return statusFilter === 'ACTIVE' ? hasOrders : !hasOrders;
    });
  }, [customers, statusFilter, orderCountByCustomer]);

  const handleCreateSubmit = async (values: CustomerFormValues) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await customerApiService.createCustomer({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address || undefined,
      });
      setFormModal(null);
      refetchCustomers();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Thêm khách hàng thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditSubmit = async (values: CustomerFormValues, customer: Customer) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await customerApiService.updateCustomer(customer.customerId, {
        fullName: values.fullName,
        email: values.email || undefined,
        address: values.address || undefined,
      });
      setFormModal(null);
      refetchCustomers();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật khách hàng thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleExportCsv = () => {
    const header = ['Họ và tên', 'Email', 'Số điện thoại', 'Địa chỉ', 'Trạng thái', 'Ngày tạo'];
    const rows = displayedCustomers.map((customer) => {
      const hasOrders = (orderCountByCustomer.get(customer.customerId) ?? 0) > 0;
      return [
        customer.fullName,
        customer.email,
        customer.phone,
        customer.address,
        hasOrders ? 'Đang hoạt động' : 'Ngừng hoạt động',
        formatDateLong(customer.createdAt),
      ];
    });
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khach-hang-trang-${pagination.currentPage}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: TableColumn<Customer>[] = [
    {
      key: 'fullName',
      label: 'Khách hàng',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{row.fullName}</p>
            {row.email && <p className="truncate text-xs text-slate-400">{row.email}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (row) => <span className="text-slate-600">{maskPhone(row.phone)}</span>,
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      render: (row) => <span className="text-slate-600">{truncateText(row.address || '—')}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        const hasOrders = (orderCountByCustomer.get(row.customerId) ?? 0) > 0;
        return (
          <Badge variant={hasOrders ? 'success' : 'neutral'}>{hasOrders ? 'Đang hoạt động' : 'Ngừng hoạt động'}</Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => formatDateLong(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/manager/customers/${row.customerId}`}
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Chỉnh sửa"
            title="Chỉnh sửa"
            onClick={() => setFormModal({ mode: 'edit', customer: row })}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/manager/dashboard" className="hover:text-blue-600">
          Bảng điều khiển
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-blue-600">Quản lý khách hàng</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi và quản lý toàn bộ khách hàng đã giao dịch với hệ thống.</p>
        </div>
        <Button onClick={() => setFormModal({ mode: 'create', customer: null })}>
          <Plus className="h-4 w-4" />
          Thêm khách hàng mới
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Input
              placeholder="Tìm theo tên hoặc số điện thoại..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-52">
            <Select
              label="Trạng thái"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
          </div>
          <Button variant="secondary" onClick={handleExportCsv} disabled={displayedCustomers.length === 0}>
            <Download className="h-4 w-4" />
            Xuất file
          </Button>
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={displayedCustomers} rowKey={(row) => row.customerId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <CustomerFormModal
        isOpen={!!formModal}
        mode={formModal?.mode ?? 'create'}
        customer={formModal?.customer}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={(values) => {
          if (formModal?.mode === 'edit' && formModal.customer) {
            handleEditSubmit(values, formModal.customer);
          } else {
            handleCreateSubmit(values);
          }
        }}
      />
    </div>
  );
}
