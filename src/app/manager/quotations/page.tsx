'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, FileText, FileCheck2, FilePen, Search, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
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
import type { Customer } from '@/types/customer';
import type { Quotation, QuotationDetail } from '@/types/quotation';

// ---------------------------------------------------------------------------
// Backend chỉ có API báo giá theo từng khách hàng (GET /customers/:customerId/quotations,
// GET /quotations/:id) — không có endpoint liệt kê TẤT CẢ báo giá toàn hệ thống. Trang này ghép
// danh sách bằng cách quét từng trang khách hàng thật (GET /customers) rồi gọi song song báo giá
// của các khách đó — dữ liệu 100% thật, chỉ là tải dần theo từng đợt khách hàng thay vì 1 lần.
// ---------------------------------------------------------------------------

const CUSTOMER_BATCH_SIZE = 10;

const STATUS_LABEL: Record<Quotation['status'], string> = {
  DRAFT: 'Nháp',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

interface QuotationRow {
  quotation: Quotation;
  customer: Customer;
}

async function fetchQuotationRowsForCustomer(customer: Customer): Promise<QuotationRow[]> {
  const qRes = await quotationApiService.getCustomerQuotations(customer.customerId, { limit: 50 });
  const list: Quotation[] = qRes.data ?? [];
  return list.map((quotation) => ({ quotation, customer }));
}

export default function Page() {
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [customersLoaded, setCustomersLoaded] = useState(0);
  const [customersTotalCount, setCustomersTotalCount] = useState<number | null>(null);
  const [currentCustomerPage, setCurrentCustomerPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { can } = usePermission();
  const canManage = can('orders:manage');

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [createCustomerId, setCreateCustomerId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<QuotationDetail | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const [deletingRow, setDeletingRow] = useState<QuotationRow | null>(null);

  useEffect(() => {
    customerApiService.getCustomers({ limit: 200 }).then((res) => setAllCustomers(res.data ?? []));
  }, []);

  // Nạp lại toàn bộ báo giá của 1 khách hàng từ server và thay thế các dòng cũ của khách đó trong
  // bảng — dùng chung cho cả tạo mới (thêm phiên bản) và sửa bản nháp (cập nhật tại chỗ).
  const refreshCustomerQuotations = async (customer: Customer) => {
    const res = await quotationApiService.getCustomerQuotations(customer.customerId, { limit: 50 });
    const list: Quotation[] = res.data ?? [];
    setRows((prev) => {
      const others = prev.filter((r) => r.customer.customerId !== customer.customerId);
      return [...list.map((quotation) => ({ quotation, customer })), ...others];
    });
  };

  const handleQuotationCreated = async () => {
    const customer = allCustomers.find((c) => c.customerId === createCustomerId);
    if (customer) await refreshCustomerQuotations(customer);
  };

  const handleEditClick = async (row: QuotationRow) => {
    setLoadingEditId(row.quotation.quotationId);
    try {
      const res = await quotationApiService.getQuotation(row.quotation.quotationId);
      setEditingCustomer(row.customer);
      setEditingQuotation(res.data);
    } finally {
      setLoadingEditId(null);
    }
  };

  const handleQuotationEdited = async () => {
    if (!editingCustomer) return;
    await refreshCustomerQuotations(editingCustomer);
  };

  const handleQuotationDeleted = async () => {
    if (!deletingRow) return;
    await refreshCustomerQuotations(deletingRow.customer);
  };

  const loadCustomerPage = async (page: number) => {
    const customersRes = await customerApiService.getCustomers({ page, limit: CUSTOMER_BATCH_SIZE });
    const customers: Customer[] = customersRes.data ?? [];
    setCustomersTotalCount(customersRes.meta?.totalCount ?? 0);

    const perCustomer = await Promise.all(customers.map(fetchQuotationRowsForCustomer));

    setRows((prev) => [...prev, ...perCustomer.flat()]);
    setCustomersLoaded((prev) => prev + customers.length);
    setCurrentCustomerPage(page);
  };

  const hasLoadedInitialPage = useRef(false);
  useEffect(() => {
    // Guard against React Strict Mode's dev-only double-invoke — loadCustomerPage accumulates into
    // `rows`, so calling it twice on mount would duplicate every row.
    if (hasLoadedInitialPage.current) return;
    hasLoadedInitialPage.current = true;
    setLoadError(null);
    loadCustomerPage(1)
      .catch(() => setLoadError('Không thể tải danh sách khách hàng. Vui lòng thử lại.'))
      .finally(() => setIsInitialLoading(false));
  }, []);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setLoadError(null);
    try {
      await loadCustomerPage(currentCustomerPage + 1);
    } catch {
      setLoadError('Không thể tải thêm khách hàng. Vui lòng thử lại.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows
      .filter(({ quotation, customer }) => {
        if (statusFilter && quotation.status !== statusFilter) return false;
        if (!term) return true;
        const customerName = customer.customerName?.toLowerCase() ?? '';
        return quotation.quotationId.toLowerCase().includes(term) || customerName.includes(term);
      })
      .sort((a, b) => new Date(b.quotation.createdAt).getTime() - new Date(a.quotation.createdAt).getTime());
  }, [rows, searchTerm, statusFilter]);

  const draftCount = rows.filter((r) => r.quotation.status === 'DRAFT').length;
  const approvedCount = rows.filter((r) => r.quotation.status === 'APPROVED').length;

  const kpiItems: KpiCardItem[] = [
    { label: 'Tổng số báo giá (đã tải)', value: rows.length, icon: FileText, iconColor: 'blue' },
    { label: 'Bản nháp', value: draftCount, icon: FilePen, iconColor: 'amber' },
    { label: 'Đã duyệt', value: approvedCount, icon: FileCheck2, iconColor: 'green' },
  ];

  const hasMoreCustomers = customersTotalCount !== null && customersLoaded < customersTotalCount;

  const columns: TableColumn<QuotationRow>[] = [
    {
      key: 'quotationId',
      label: 'Mã báo giá',
      render: ({ quotation }) => (
        <Link href={`/manager/quotations/${quotation.quotationId}`} className="font-mono text-sm font-semibold text-blue-600 hover:underline">
          {quotation.quotationCode}
        </Link>
      ),
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: ({ customer }) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={customer.customerName} size="sm" />
          <span className="truncate font-medium text-slate-700">{customer.customerName}</span>
        </div>
      ),
    },
    {
      key: 'version',
      label: 'Phiên bản',
      render: ({ quotation }) => <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{quotation.version}</span>,
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
      render: ({ quotation }) => <Badge variant={getStatusBadgeVariant(quotation.status)}>{STATUS_LABEL[quotation.status]}</Badge>,
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
          {canManage && row.quotation.status === 'DRAFT' && (
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
          {canManage && row.quotation.status === 'DRAFT' && (
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
          <p className="mt-1 text-sm text-slate-500">Tổng hợp các phiên bản báo giá đã gửi khách hàng.</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <div className="w-56">
              <Select
                value={createCustomerId}
                onChange={(e) => setCreateCustomerId(e.target.value)}
                placeholder="-- Chọn khách hàng --"
                options={allCustomers.map((c) => ({ value: c.customerId, label: c.customerName }))}
              />
            </div>
            <Button disabled={!createCustomerId} onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Tạo báo giá mới
            </Button>
          </div>
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
              placeholder="Tìm theo mã báo giá, khách hàng..."
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'DRAFT', label: 'Nháp' },
                { value: 'APPROVED', label: 'Đã duyệt' },
                { value: 'REJECTED', label: 'Từ chối' },
              ]}
            />
          </div>
        </div>

        <p className="mt-3 text-xs italic text-slate-400">
          Đã tải báo giá từ {customersLoaded}/{customersTotalCount ?? '…'} khách hàng. Tìm kiếm/lọc chỉ áp dụng trong phạm vi đã tải — nhấn &quot;Tải
          thêm khách hàng&quot; để mở rộng phạm vi.
        </p>
      </motion.div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="overflow-x-auto">
          <Table columns={columns} rows={filteredRows} rowKey={(row) => row.quotation.quotationId} isLoading={isInitialLoading} />
        </div>

        {loadError && <p className="mt-4 text-center text-sm text-red-600">{loadError}</p>}

        {hasMoreCustomers && (
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoadingMore}>
              {!isLoadingMore && <Loader2 className="h-4 w-4" />}
              Tải thêm khách hàng ({customersLoaded}/{customersTotalCount})
            </Button>
          </div>
        )}
      </div>

      <CreateQuotationModal
        isOpen={isCreateModalOpen}
        customerId={createCustomerId}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleQuotationCreated}
      />
      <CreateQuotationModal
        isOpen={Boolean(editingQuotation)}
        customerId={editingCustomer?.customerId ?? ''}
        editingQuotation={editingQuotation}
        onClose={() => {
          setEditingQuotation(null);
          setEditingCustomer(null);
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
