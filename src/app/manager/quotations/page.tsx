'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, FileText, FileCheck2, FilePen, Search, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { quotationApiService } from '@/services/quotation.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import DashboardStats, { KpiCardItem } from '@/components/reports/DashboardStats';
import CreateQuotationModal from '@/components/orders/CreateQuotationModal';
import DeleteQuotationModal from '@/components/orders/DeleteQuotationModal';
import { usePermission } from '@/hooks/usePermission';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { Quotation, QuotationDetail } from '@/types/quotation';

// ---------------------------------------------------------------------------
// Backend chỉ có API báo giá theo từng đơn hàng (GET /orders/:orderId/quotations,
// GET /quotations/:id) — không có endpoint liệt kê TẤT CẢ báo giá toàn hệ thống
// (xem docs/api/08-quotations.md, docs/more-require.md mục (m)). Trang này ghép danh sách
// bằng cách quét từng trang đơn hàng thật (GET /orders) rồi gọi song song báo giá của các đơn
// đó — dữ liệu 100% thật, chỉ là tải dần theo từng đợt đơn hàng thay vì 1 lần cho toàn hệ thống.
// ---------------------------------------------------------------------------

const ORDER_BATCH_SIZE = 10;

const STATUS_LABEL: Record<Quotation['status'], string> = {
  draft: 'Nháp',
  confirmed: 'Đã duyệt',
};

interface QuotationRow {
  quotation: Quotation;
  order: Order;
}

async function fetchQuotationRowsForOrder(order: Order): Promise<QuotationRow[]> {
  const qRes = await quotationApiService.getOrderQuotations(order.orderId, { limit: 50 });
  const list: Quotation[] = qRes.data ?? [];
  return list.map((quotation) => ({ quotation, order }));
}

export default function Page() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(0);
  const [ordersTotalCount, setOrdersTotalCount] = useState<number | null>(null);
  const [currentOrderPage, setCurrentOrderPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { can } = usePermission();
  const canManage = can('orders:manage');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<QuotationDetail | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const [deletingRow, setDeletingRow] = useState<QuotationRow | null>(null);

  useEffect(() => {
    customerApiService.getCustomers({ limit: 200 }).then((res) => setCustomers(res.data ?? []));
  }, []);

  // Nạp lại toàn bộ báo giá của 1 đơn hàng từ server và thay thế các dòng cũ của đơn đó trong
  // bảng — dùng chung cho cả tạo mới (thêm phiên bản) và sửa bản nháp (cập nhật tại chỗ).
  const refreshOrderQuotations = async (order: Order) => {
    const res = await quotationApiService.getOrderQuotations(order.orderId, { limit: 50 });
    const list: Quotation[] = res.data ?? [];
    setRows((prev) => {
      const others = prev.filter((r) => r.order.orderId !== order.orderId);
      return [...list.map((quotation) => ({ quotation, order })), ...others];
    });
  };

  // Đơn hàng chỉ được chọn NGAY TRÊN popup tạo báo giá (không còn bước chọn đơn hàng riêng trước
  // đó) — nên ở đây chỉ biết orderId sau khi tạo xong, phải tự fetch lại Order để có đủ dữ liệu
  // hiển thị (tên khách hàng...) cho dòng mới trong bảng.
  const handleQuotationCreated = async (orderId: string) => {
    const orderRes = await orderApiService.getOrder(orderId);
    await refreshOrderQuotations(orderRes.data);
  };

  const handleEditClick = async (row: QuotationRow) => {
    setLoadingEditId(row.quotation.quotationId);
    try {
      const res = await quotationApiService.getQuotation(row.quotation.quotationId);
      setEditingOrder(row.order);
      setEditingQuotation(res.data);
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleQuotationEdited = async () => {
    if (!editingOrder) return;
    await refreshOrderQuotations(editingOrder);
  };

  const handleQuotationDeleted = async () => {
    if (!deletingRow) return;
    await refreshOrderQuotations(deletingRow.order);
  };

  const loadOrderPage = async (page: number) => {
    const ordersRes = await orderApiService.getOrders({ page, limit: ORDER_BATCH_SIZE });
    const orders: Order[] = ordersRes.data ?? [];
    setOrdersTotalCount(ordersRes.meta?.totalCount ?? 0);

    const perOrder = await Promise.all(orders.map(fetchQuotationRowsForOrder));

    setRows((prev) => [...prev, ...perOrder.flat()]);
    setOrdersLoaded((prev) => prev + orders.length);
    setCurrentOrderPage(page);
  };

  const hasLoadedInitialPage = useRef(false);
  useEffect(() => {
    // Guard against React Strict Mode's dev-only double-invoke — loadOrderPage accumulates into
    // `rows`, so calling it twice on mount would duplicate every row.
    if (hasLoadedInitialPage.current) return;
    hasLoadedInitialPage.current = true;
    loadOrderPage(1).finally(() => setIsInitialLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      await loadOrderPage(currentOrderPage + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows
      .filter(({ quotation, order }) => {
        if (statusFilter && quotation.status !== statusFilter) return false;
        if (!term) return true;
        const customerName = customerById.get(order.customerId)?.fullName?.toLowerCase() ?? '';
        return (
          quotation.quotationId.toLowerCase().includes(term) ||
          order.orderId.toLowerCase().includes(term) ||
          customerName.includes(term)
        );
      })
      .sort((a, b) => new Date(b.quotation.createdAt).getTime() - new Date(a.quotation.createdAt).getTime());
  }, [rows, searchTerm, statusFilter, customerById]);

  const draftCount = rows.filter((r) => r.quotation.status === 'draft').length;
  const confirmedCount = rows.filter((r) => r.quotation.status === 'confirmed').length;

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng số báo giá (đã tải)', value: rows.length, icon: FileText, iconColor: 'blue' },
    { label: 'Bản nháp', value: draftCount, icon: FilePen, iconColor: 'amber' },
    { label: 'Đã duyệt', value: confirmedCount, icon: FileCheck2, iconColor: 'green' },
  ];

  const hasMoreOrders = ordersTotalCount !== null && ordersLoaded < ordersTotalCount;

  const columns: TableColumn<QuotationRow>[] = [
    {
      key: 'quotationId',
      label: 'Mã báo giá',
      render: ({ quotation }) => (
        <Link href={`/manager/quotations/${quotation.quotationId}`} className="font-mono text-sm font-semibold text-blue-600 hover:underline">
          #{quotation.quotationId}
        </Link>
      ),
    },
    {
      key: 'orderId',
      label: 'Mã đơn hàng',
      render: ({ order }) => (
        <Link href={`/manager/orders/${order.orderId}`} className="font-mono text-sm text-slate-500 hover:text-blue-600 hover:underline">
          #{order.orderId}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: ({ order }) => {
        const customer = customerById.get(order.customerId);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={customer?.fullName ?? String(order.customerId)} size="sm" />
            <span className="truncate font-medium text-slate-700">{customer?.fullName ?? `KH #${order.customerId}`}</span>
          </div>
        );
      },
    },
    {
      key: 'version',
      label: 'Phiên bản',
      render: ({ quotation }) => <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">v{quotation.version}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      className: 'text-right font-bold text-slate-900',
      render: ({ quotation }) => formatCurrency(quotation.totalAmount),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: ({ quotation }) => <span className="whitespace-nowrap text-sm text-slate-500">{formatDate(quotation.createdAt)}</span>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: ({ quotation }) => <Badge variant={getStatusBadgeVariant(quotation.status.toUpperCase())}>{STATUS_LABEL[quotation.status]}</Badge>,
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/manager/quotations/${row.quotation.quotationId}`}
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
            className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {canManage && row.quotation.status === 'draft' && (
            <button
              type="button"
              onClick={() => handleEditClick(row)}
              disabled={loadingEditId === row.quotation.quotationId}
              aria-label="Sửa báo giá"
              title="Sửa báo giá"
              className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
            >
              {loadingEditId === row.quotation.quotationId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </button>
          )}
          {canManage && row.quotation.status === 'draft' && (
            <button
              type="button"
              onClick={() => setDeletingRow(row)}
              aria-label="Xóa bản nháp"
              title="Xóa bản nháp"
              className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Danh sách báo giá</h1>
          <p className="mt-1 text-sm text-slate-500">Tổng hợp các phiên bản báo giá đã gửi khách hàng theo từng đơn hàng.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Tạo báo giá mới
          </Button>
        )}
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
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã báo giá, mã đơn, khách hàng..."
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'draft', label: 'Nháp' }, { value: 'confirmed', label: 'Đã duyệt' }]}
            />
          </div>
        </div>

        <p className="mt-3 text-xs italic text-slate-400">
          Đã tải báo giá từ {ordersLoaded}/{ordersTotalCount ?? '…'} đơn hàng. Tìm kiếm/lọc chỉ áp dụng trong phạm vi đã tải — nhấn &quot;Tải thêm
          đơn hàng&quot; để mở rộng phạm vi.
        </p>
      </motion.div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table columns={columns} rows={filteredRows} rowKey={(row) => row.quotation.quotationId} isLoading={isInitialLoading} />
        </div>

        {hasMoreOrders && (
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoadingMore}>
              {!isLoadingMore && <Loader2 className="h-4 w-4" />}
              Tải thêm đơn hàng ({ordersLoaded}/{ordersTotalCount})
            </Button>
          </div>
        )}
      </div>

      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleQuotationCreated}
      />
      <CreateQuotationModal
        isOpen={Boolean(editingQuotation)}
        orderId={editingOrder?.orderId ?? ''}
        editingQuotation={editingQuotation}
        onClose={() => {
          setEditingQuotation(null);
          setEditingOrder(null);
        }}
        onSuccess={handleQuotationEdited}
      />
      <DeleteQuotationModal
        isOpen={Boolean(deletingRow)}
        quotation={deletingRow?.quotation ?? null}
        onClose={() => setDeletingRow(null)}
        onSuccess={handleQuotationDeleted}
      />
    </div>
  );
}
