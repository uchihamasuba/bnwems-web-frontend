'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Wallet,
} from 'lucide-react';
import { customerApiService } from '@/services/customer.service';
import { orderApiService } from '@/services/order.service';
import { quotationApiService } from '@/services/quotation.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { CustomerFormModal, CustomerFormValues } from '@/components/customers/CustomerFormModal';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, formatDateLong } from '@/utils/formatDate';
import { formatPhoneDisplay } from '@/utils/formatPhone';
import { ORDER_STATUS_LABEL } from '@/constants/order-status';
import type { Customer } from '@/types/customer';
import type { Order } from '@/types/order';

interface CustomerOrderRow extends Order {
  orderValue: number | null;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCustomerDetail() {
      setIsLoading(true);
      setLoadError('');
      try {
        const customerRes = await customerApiService.getCustomer(id);
        if (cancelled) return;
        setCustomer(customerRes.data);

        const ordersRes = await orderApiService.getOrders({ limit: 200 });
        const customerOrders = ordersRes.data.filter((order: Order) => order.customerId === id);

        const customerQuotationsRes = await quotationApiService.getCustomerQuotations(id, { limit: 1000 }).catch(() => ({ data: [] }));
        const customerQuotations = customerQuotationsRes.data;

        const ordersWithValue = customerOrders.map((order: Order) => {
          const orderQuotes = customerQuotations.filter((q: any) => q.orderId === order.orderId);
          const accepted = orderQuotes.find((q: any) => q.status === 'APPROVED' || q.status === 'ACCEPTED');
          const latest = orderQuotes[0];
          return {
            ...order,
            orderValue: accepted?.totalAmount ?? latest?.totalAmount ?? null,
          };
        });

        if (!cancelled) {
          setOrders(
            ordersWithValue.sort(
              (a: any, b: any) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime()
            )
          );
        }
      } catch (err) {
        if (!cancelled) setLoadError(getErrorMessage(err, 'Không thể tải thông tin khách hàng'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCustomerDetail();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const transactionSummary = useMemo(() => {
    const totalValue = orders.reduce((sum, order) => sum + (order.orderValue ?? 0), 0);
    const latestOrder = orders[0] ?? null;
    return { totalOrders: orders.length, totalValue, latestOrder };
  }, [orders]);

  const handleEditSubmit = async (values: CustomerFormValues) => {
    if (!customer) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      await customerApiService.updateCustomer(customer.customerId, {
        fullName: values.fullName,
        email: values.email || undefined,
        address: values.address || undefined,
      });
      const refreshed = await customerApiService.getCustomer(id);
      setCustomer(refreshed.data);
      setIsEditOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật khách hàng thất bại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderColumns: TableColumn<CustomerOrderRow>[] = [
    {
      key: 'orderNumber',
      label: 'Mã đơn',
      render: (row) => (
        <Link href={`/manager/orders/${row.orderId}`} className="font-medium text-blue-600 hover:underline">
          #{row.orderNumber}
        </Link>
      ),
    },
    {
      key: 'venueAddress',
      label: 'Địa điểm',
      render: (row) => <span className="text-slate-600">{row.venueAddress}</span>,
    },
    {
      key: 'eventStartDate',
      label: 'Ngày tổ chức',
      render: (row) => formatDate(row.eventStartDate),
    },
    {
      key: 'orderValue',
      label: 'Giá trị đơn',
      render: (row) => (row.orderValue != null ? formatCurrency(row.orderValue) : '—'),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>{ORDER_STATUS_LABEL[row.status] ?? row.status}</Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center p-6">
        <p className="text-sm text-slate-500">Đang tải thông tin khách hàng...</p>
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="p-6">
        <Link
          href="/manager/customers"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <p className="mt-4 text-sm text-red-600">{loadError || 'Không tìm thấy khách hàng.'}</p>
      </div>
    );
  }

  const isActive = orders.length > 0;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/manager/dashboard" className="hover:text-blue-600">
            Bảng điều khiển
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/manager/customers" className="hover:text-blue-600">
            Quản lý khách hàng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-blue-600">{customer.fullName}</span>
        </nav>
        <Link href="/manager/customers">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={customer.fullName} size="lg" className="h-20 w-20 text-xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{customer.fullName}</h1>
                <Badge variant={isActive ? 'success' : 'neutral'}>{isActive ? 'ĐANG HOẠT ĐỘNG' : 'NGỪNG HOẠT ĐỘNG'}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {formatPhoneDisplay(customer.phone)}
                </span>
                {customer.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            <Pencil className="h-4 w-4 text-blue-600" />
            Sửa thông tin
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Thông tin liên hệ</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Số điện thoại</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {formatPhoneDisplay(customer.phone)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email công việc</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {customer.email || '—'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Địa chỉ</p>
                <p className="mt-1 inline-flex items-start gap-2 text-sm font-medium text-slate-800">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {customer.address || '—'}
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-400">
              Tạo bởi {user?.fullName ?? 'Hệ thống'} · {formatDate(customer.createdAt)}
            </p>
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Lịch sử đơn hàng</h2>
              </div>
              <Badge variant="info">{transactionSummary.totalOrders} đơn hàng</Badge>
            </div>
            <Table columns={orderColumns} rows={orders} rowKey={(row) => row.orderId} emptyText="Chưa có đơn hàng nào." />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Tổng quan giao dịch</h2>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tổng số đơn đã đặt</p>
                <div className="mt-2 inline-flex min-w-[72px] items-center justify-center rounded-lg bg-blue-50 px-4 py-3 text-2xl font-bold text-blue-700">
                  {transactionSummary.totalOrders}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tổng giá trị giao dịch</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(transactionSummary.totalValue)}</p>
              </div>
              {transactionSummary.latestOrder && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Đơn gần nhất</p>
                  <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{formatDate(transactionSummary.latestOrder.eventStartDate)}</p>
                    <Link
                      href={`/manager/orders/${transactionSummary.latestOrder.orderId}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      #{transactionSummary.latestOrder.orderNumber}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href={`/manager/orders/create?customerId=${customer.customerId}`} className="mt-6 block">
              <Button variant="secondary" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Plus className="h-4 w-4" />
                Tạo đơn hàng mới cho khách này
              </Button>
            </Link>
          </section>

          <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tiến độ chăm sóc</h2>
            <div className="mt-4 flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Đã xác thực danh tính</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Hoàn tất bởi Hệ thống · {formatDateLong(customer.createdAt)}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <CustomerFormModal
        isOpen={isEditOpen}
        mode="edit"
        customer={customer}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        onClose={() => {
          setIsEditOpen(false);
          setFormError('');
        }}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
