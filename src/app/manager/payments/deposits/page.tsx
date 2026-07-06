'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Loader2, CheckCircle2, CircleDollarSign, Clock, BadgeCheck } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { paymentApiService } from '@/services/payment.service';
import { customerApiService } from '@/services/customer.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Order } from '@/types/order';
import type { Deposit, DepositStatus } from '@/types/payment';
import type { Customer } from '@/types/customer';

const ORDER_BATCH_SIZE = 10;

interface DepositRow {
  deposit: Deposit;
  order: Order;
}

type StatusFilter = '' | DepositStatus;

function statusLabel(status: DepositStatus): string {
  if (status === 'SUCCESS') return 'Đã hạch toán';
  if (status === 'OVERDUE') return 'Quá hạn';
  if (status === 'CANCELLED') return 'Đã hủy';
  return 'Chờ đóng cọc';
}

function statusBadgeVariant(status: DepositStatus): 'success' | 'warning' | 'error' {
  if (status === 'SUCCESS') return 'success';
  if (status === 'OVERDUE' || status === 'CANCELLED') return 'error';
  return 'warning';
}

async function fetchDepositsForOrder(order: Order): Promise<DepositRow[]> {
  const res = await paymentApiService.getOrderDeposits(order.orderId);
  const list: Deposit[] = res.data ?? [];
  return list.map((deposit) => ({ deposit, order }));
}

export default function Page() {
  const [rows, setRows] = useState<DepositRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(0);
  const [ordersTotalCount, setOrdersTotalCount] = useState<number | null>(null);
  const [currentOrderPage, setCurrentOrderPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');

  // Confirm modal state
  const [confirmRow, setConfirmRow] = useState<DepositRow | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    customerApiService.getCustomers({ limit: 200 }).then((res) => setCustomers(res.data ?? []));
  }, []);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const loadOrderPage = async (page: number) => {
    const ordersRes = await orderApiService.getOrders({ page, limit: ORDER_BATCH_SIZE });
    const orders: Order[] = ordersRes.data ?? [];
    setOrdersTotalCount(ordersRes.meta?.totalCount ?? 0);
    const perOrder = await Promise.all(orders.map(fetchDepositsForOrder));
    setRows((prev) => [...prev, ...perOrder.flat()]);
    setOrdersLoaded((prev) => prev + orders.length);
    setCurrentOrderPage(page);
  };

  const hasLoadedInitialPage = useRef(false);
  useEffect(() => {
    if (hasLoadedInitialPage.current) return;
    hasLoadedInitialPage.current = true;
    setLoadError(null);
    loadOrderPage(1)
      .catch(() => setLoadError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại.'))
      .finally(() => setIsInitialLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      await loadOrderPage(currentOrderPage + 1);
    } catch {
      setLoadError('Không thể tải thêm đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter(({ deposit, order }) => {
      if (statusFilter && deposit.status !== statusFilter) return false;
      if (!term) return true;
      const customer = customerById.get(order.customerId);
      return (
        deposit.depositCode.toLowerCase().includes(term) ||
        order.orderCode.toLowerCase().includes(term) ||
        (customer?.customerName?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [rows, searchTerm, statusFilter, customerById]);

  // KPI
  const totalRequested = rows.reduce((s, r) => s + Number(r.deposit.amount), 0);
  const totalConfirmed = rows.filter((r) => r.deposit.status === 'SUCCESS').reduce((s, r) => s + Number(r.deposit.amount), 0);
  const pendingCount = new Set(rows.filter((r) => r.deposit.status === 'PENDING').map((r) => r.order.orderId)).size;

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng tiền cọc đã ghi nhận', value: formatCurrency(totalRequested), icon: CircleDollarSign, iconColor: 'blue' },
    { label: 'Đã hạch toán', value: formatCurrency(totalConfirmed), icon: BadgeCheck, iconColor: 'green' },
    { label: 'Số đơn đang chờ đóng cọc', value: `${pendingCount} sự kiện`, icon: Clock, iconColor: pendingCount > 0 ? 'amber' : 'green' },
  ];

  const handleOpenConfirm = (row: DepositRow) => {
    setConfirmRow(row);
    setConfirmError(null);
  };

  const handleConfirm = async () => {
    if (!confirmRow) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await paymentApiService.updateDepositStatus(confirmRow.deposit.depositId, { status: 'SUCCESS' });
      setRows((prev) =>
        prev.map((r) =>
          r.deposit.depositId === confirmRow.deposit.depositId ? { ...r, deposit: { ...r.deposit, status: 'SUCCESS' } } : r,
        ),
      );
      setConfirmRow(null);
    } catch {
      setConfirmError('Xác nhận cọc thất bại. Vui lòng thử lại.');
    } finally {
      setIsConfirming(false);
    }
  };

  const hasMoreOrders = ordersTotalCount !== null && ordersLoaded < ordersTotalCount;

  const FILTER_BUTTONS: { label: string; value: StatusFilter }[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ đóng cọc', value: 'PENDING' },
    { label: 'Đã hạch toán', value: 'SUCCESS' },
    { label: 'Quá hạn', value: 'OVERDUE' },
  ];

  const columns: TableColumn<DepositRow>[] = [
    {
      key: 'depositCode',
      label: 'Mã cọc',
      render: ({ deposit }) => <span className="font-mono text-sm font-semibold text-blue-600">{deposit.depositCode}</span>,
    },
    {
      key: 'orderId',
      label: 'Mã đơn hàng',
      render: ({ order }) => (
        <Link href={`/manager/orders/${order.orderId}`} className="font-mono text-sm text-slate-500 hover:text-blue-600 hover:underline">
          {order.orderCode}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Tên khách hàng',
      render: ({ order }) => {
        const customer = customerById.get(order.customerId);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={customer?.customerName ?? String(order.customerId)} size="sm" />
            <span className="truncate font-semibold text-slate-800">{customer?.customerName ?? `KH #${order.customerId}`}</span>
          </div>
        );
      },
    },
    {
      key: 'amount',
      label: 'Số tiền đặt cọc',
      className: 'font-bold text-slate-900',
      render: ({ deposit }) => formatCurrency(Number(deposit.amount)),
    },
    {
      key: 'paymentDate',
      label: 'Ngày nhận cọc',
      render: ({ deposit }) => (deposit.paymentDate ? formatDate(deposit.paymentDate) : '—'),
    },
    {
      key: 'status',
      label: 'Trạng thái cọc',
      render: ({ deposit }) => <Badge variant={statusBadgeVariant(deposit.status)}>{statusLabel(deposit.status)}</Badge>,
    },
    {
      key: 'actions',
      label: 'Thao tác nghiệp vụ',
      render: (row) => {
        if (row.deposit.status !== 'PENDING') {
          return <span className="text-sm text-slate-400">—</span>;
        }
        return (
          <button
            type="button"
            onClick={() => handleOpenConfirm(row)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-2.5 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Xác nhận cọc
          </button>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quản lý đặt cọc</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi tiền cọc đã ghi nhận và xác nhận từng đơn hàng.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-6">
        <DashboardStats items={kpiItems} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.22 }}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã cọc, mã đơn hàng hoặc tên khách hàng..."
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_BUTTONS.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setStatusFilter(btn.value)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                  statusFilter === btn.value
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs italic text-slate-400">Đã tải từ {ordersLoaded}/{ordersTotalCount ?? '…'} đơn hàng.</p>
      </motion.div>

      {/* Table */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table columns={columns} rows={filteredRows} rowKey={(row) => row.deposit.depositId} isLoading={isInitialLoading} />
        </div>

        {!isInitialLoading && filteredRows.length === 0 && rows.length > 0 && (
          <p className="py-8 text-center text-sm text-slate-400">Không tìm thấy khoản cọc phù hợp với bộ lọc hiện tại.</p>
        )}

        {loadError && <p className="mt-4 text-center text-sm text-red-600">{loadError}</p>}

        {hasMoreOrders && (
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoadingMore}>
              {!isLoadingMore && <Loader2 className="h-4 w-4" />}
              Tải thêm đơn hàng ({ordersLoaded}/{ordersTotalCount})
            </Button>
          </div>
        )}
      </div>

      {/* Confirm Deposit Modal */}
      <Modal
        isOpen={Boolean(confirmRow)}
        onClose={() => setConfirmRow(null)}
        title="Xác nhận đặt cọc"
        subtitle={
          confirmRow
            ? `${confirmRow.deposit.depositCode} — ${customerById.get(confirmRow.order.customerId)?.customerName ?? confirmRow.order.orderCode}`
            : ''
        }
      >
        <div className="space-y-4 p-1">
          {confirmRow && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Mã đơn hàng</span>
                <span className="font-semibold text-slate-800">{confirmRow.order.orderCode}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 py-1.5">
                <span className="text-slate-500">Số tiền đặt cọc</span>
                <span className="font-bold text-slate-900">{formatCurrency(Number(confirmRow.deposit.amount))}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 py-1.5">
                <span className="text-slate-500">Phương thức</span>
                <span className="font-semibold text-slate-800">{confirmRow.deposit.paymentMethod ?? '—'}</span>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Xác nhận rằng bạn đã nhận được khoản tiền cọc từ khách hàng và muốn hạch toán vào hệ thống?
          </p>

          {confirmError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-200">{confirmError}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setConfirmRow(null)} disabled={isConfirming}>
              Hủy
            </Button>
            <Button onClick={handleConfirm} isLoading={isConfirming}>
              <CheckCircle2 className="h-4 w-4" />
              Xác nhận đã nhận cọc
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
