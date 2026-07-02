'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Pencil, Plus, Wrench } from 'lucide-react';
import { equipmentApiService } from '@/services/equipment.service';
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
import type { EquipmentItem } from '@/types/equipment';
import type { InventoryRow } from '@/types/inventory';

interface StockRow extends InventoryRow {
  itemName: string;
}

export default function Page() {
  const { can } = usePermission();
  const canManage = can('master-data:manage');

  const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([]);
  const [itemFilter, setItemFilter] = useState('');
  const [rows, setRows] = useState<StockRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [detailRow, setDetailRow] = useState<StockRow | null>(null);
  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; row: StockRow | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const refetchRows = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    equipmentApiService.getEquipment({ limit: 200 }).then((res) => setEquipmentItems(res.data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    inventoryApiService
      .getInventory({
        equipmentItemId: itemFilter || undefined,
        page: pagination.currentPage,
        limit: pagination.limit,
      })
      .then((res) => {
        const itemsById = new Map(equipmentItems.map((item) => [item.equipmentItemId, item]));
        setRows(
          (res.data as InventoryRow[]).map((row) => ({
            ...row,
            itemName: itemsById.get(row.equipmentItemId)?.name ?? row.equipmentItemId,
          }))
        );
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemFilter, pagination.currentPage, pagination.limit, equipmentItems, refreshToken]);

  const handleCreateSubmit = async (values: InventoryFormValues) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await inventoryApiService.createInventory({
        equipmentItemId: values.equipmentItemId,
        availableQuantity: values.availableQuantity,
      });
      setFormModal(null);
      refetchRows();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Thêm tồn kho thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditSubmit = async (values: InventoryFormValues, row: StockRow) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await inventoryApiService.updateInventory(row.inventoryId, {
        availableQuantity: values.availableQuantity,
        reservedQuantity: values.reservedQuantity,
        damagedQuantity: values.damagedQuantity,
      });
      setFormModal(null);
      refetchRows();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật tồn kho thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const itemOptions = equipmentItems.map((item) => ({ value: item.equipmentItemId, label: item.name }));

  const columns: TableColumn<StockRow>[] = [
    { key: 'equipmentItemId', label: 'Mã thiết bị' },
    { key: 'itemName', label: 'Tên thiết bị' },
    { key: 'totalQuantity', label: 'Tổng số lượng' },
    { key: 'availableQuantity', label: 'Có sẵn' },
    { key: 'reservedQuantity', label: 'Đã giữ chỗ' },
    {
      key: 'damagedQuantity',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.damagedQuantity > 0 ? 'MAINTENANCE' : 'ACTIVE')}>
          {row.damagedQuantity > 0 ? `Hỏng: ${row.damagedQuantity}` : 'Bình thường'}
        </Badge>
      ),
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
              aria-label="Chỉnh sửa"
              title="Chỉnh sửa"
              onClick={() => setFormModal({ mode: 'edit', row })}
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
          <p className="mt-1 text-sm text-slate-500">Số lượng có sẵn / đã giữ chỗ / hỏng theo từng thiết bị (UC 2.13).</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/inventory/maintenance">
            <Button variant="secondary">
              <Wrench className="h-4 w-4" />
              Thiết bị đang bảo trì
            </Button>
          </Link>
          {canManage && (
            <Button onClick={() => setFormModal({ mode: 'create', row: null })}>
              <Plus className="h-4 w-4" />
              Thêm tồn kho
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
        mode={formModal?.mode ?? 'create'}
        row={formModal?.row}
        equipmentItems={equipmentItems}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={(values) => {
          if (formModal?.mode === 'edit' && formModal.row) {
            handleEditSubmit(values, formModal.row);
          } else {
            handleCreateSubmit(values);
          }
        }}
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
