'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Wrench } from 'lucide-react';
import { catalogApiService } from '@/services/catalog.service';
import { inventoryApiService } from '@/services/inventory.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { InventoryDetailModal } from '@/components/inventory/InventoryDetailModal';
import { InventoryFormModal, InventoryFormValues } from '@/components/inventory/InventoryFormModal';
import { usePagination } from '@/hooks/usePagination';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/formatDate';
import type { Item } from '@/types/catalog';
import type { InventoryRow } from '@/types/inventory';

export default function Page() {
  const { can } = usePermission();
  const canManage = can('master-data:manage');

  const [items, setItems] = useState<Item[]>([]);
  const [itemFilter, setItemFilter] = useState('');
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [detailRow, setDetailRow] = useState<InventoryRow | null>(null);
  const [formModal, setFormModal] = useState<{ row: InventoryRow | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const refetchRows = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    catalogApiService.getItems({ limit: 200 }).then((res) => setItems(res.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    inventoryApiService
      .getInventory({
        itemId: itemFilter || undefined,
        page: pagination.currentPage,
        limit: pagination.limit,
      })
      .then((res) => {
        setRows(res.data as InventoryRow[]);
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemFilter, pagination.currentPage, pagination.limit, refreshToken]);

  const handleAdjustSubmit = async (values: InventoryFormValues) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await inventoryApiService.adjustInventory({
        itemId: values.itemId,
        quantityChange: values.quantityChange,
        notes: values.notes || undefined,
      });
      setFormModal(null);
      refetchRows();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Điều chỉnh tồn kho thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const itemOptions = items.map((item) => ({ value: item.itemId, label: item.itemName }));

  const columns: TableColumn<InventoryRow>[] = [
    { key: 'itemId', label: 'Mã thiết bị' },
    { key: 'itemName', label: 'Tên thiết bị', render: (row) => row.itemName ?? row.itemId },
    { key: 'quantityAvailable', label: 'Có sẵn' },
    { key: 'quantityReserved', label: 'Đã giữ chỗ' },
    {
      key: 'quantityDamaged',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.quantityDamaged > 0 ? 'MAINTENANCE' : 'ACTIVE')}>
          {row.quantityDamaged > 0 ? `Hỏng: ${row.quantityDamaged}` : 'Bình thường'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Cập nhật gần nhất',
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
            onClick={() => setDetailRow(row)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManage && (
            <button
              type="button"
              aria-label="Điều chỉnh"
              title="Điều chỉnh"
              onClick={() => setFormModal({ row })}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Tình trạng tồn kho</h1>
          <p className="mt-1 text-sm text-slate-500">Số lượng có sẵn / đã giữ chỗ / hỏng theo từng thiết bị.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/inventory/maintenance">
            <Button variant="secondary">
              <Wrench className="h-4 w-4" />
              Thiết bị đang bảo trì
            </Button>
          </Link>
          {canManage && (
            <Button onClick={() => setFormModal({ row: null })}>
              <Pencil className="h-4 w-4" />
              Điều chỉnh tồn kho
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Select
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
                setPage(1);
              }}
              options={[{ value: '', label: 'Tất cả thiết bị' }, ...itemOptions]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={rows} rowKey={(row) => row.inventoryId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <InventoryDetailModal isOpen={!!detailRow} row={detailRow} onClose={() => setDetailRow(null)} />

      <InventoryFormModal
        isOpen={!!formModal}
        row={formModal?.row ?? null}
        items={items}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
