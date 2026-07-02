'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Pencil, Ban, CheckCircle2, Plus, FolderTree } from 'lucide-react';
import { equipmentApiService } from '@/services/equipment.service';
import { catalogApiService } from '@/services/catalog.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { EquipmentFormModal, EquipmentFormValues } from '@/components/catalog/EquipmentFormModal';
import { EquipmentDetailModal } from '@/components/catalog/EquipmentDetailModal';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { CatalogCategory } from '@/types/catalog';
import type { EquipmentItem } from '@/types/equipment';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã vô hiệu hóa' },
];

export default function Page() {
  const { can } = usePermission();
  const canManage = can('master-data:manage');

  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    catalogApiService.getCatalogCategories({ limit: 100 }).then((res) => setCategories(res.data));
  }, []);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; item: EquipmentItem | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');

  const [detailItem, setDetailItem] = useState<EquipmentItem | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const refetchItems = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    equipmentApiService
      .getEquipment({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        setItems(res.data);
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, debouncedSearch, categoryFilter, statusFilter, refreshToken]);

  const handleCreateSubmit = async (values: EquipmentFormValues) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await equipmentApiService.createEquipment(values);
      setFormModal(null);
      refetchItems();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Tạo thiết bị thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditSubmit = async (values: EquipmentFormValues, item: EquipmentItem) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await equipmentApiService.updateEquipment(item.equipmentItemId, {
        name: values.name,
        category: values.category,
        unit: values.unit,
        rentalPrice: values.rentalPrice,
        costPrice: values.costPrice,
        replacementValue: values.replacementValue,
      });
      setFormModal(null);
      refetchItems();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật thiết bị thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (item: EquipmentItem) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    const confirmMessage =
      nextStatus === 'active'
        ? `Kích hoạt lại thiết bị "${item.name}"?`
        : `Vô hiệu hóa thiết bị "${item.name}"? Thiết bị sẽ không được sử dụng cho đơn hàng mới.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await equipmentApiService.updateEquipmentStatus(item.equipmentItemId, { status: nextStatus });
      refetchItems();
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    }
  };

  const columns: TableColumn<EquipmentItem>[] = [
    { key: 'code', label: 'Mã' },
    { key: 'name', label: 'Tên thiết bị' },
    { key: 'category', label: 'Danh mục', render: (row) => row.category || '—' },
    { key: 'unit', label: 'Đơn vị' },
    {
      key: 'rentalPrice',
      label: 'Giá thuê',
      render: (row) => formatCurrency(row.rentalPrice),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status === 'active' ? 'ACTIVE' : 'INACTIVE')}>
          {row.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => formatDate(row.createdAt),
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
            onClick={() => setDetailItem(row)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManage && (
            <>
              <button
                type="button"
                aria-label="Chỉnh sửa"
                title="Chỉnh sửa"
                onClick={() => setFormModal({ mode: 'edit', item: row })}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                title={row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                onClick={() => handleToggleStatus(row)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                {row.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Danh mục thiết bị</h1>
          <p className="mt-1 text-sm text-slate-500">Xem, tạo, cập nhật và vô hiệu hóa thiết bị trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/catalog/categories">
            <Button variant="secondary">
              <FolderTree className="h-4 w-4" />
              Quản lý danh mục
            </Button>
          </Link>
          {canManage && (
            <Button onClick={() => setFormModal({ mode: 'create', item: null })}>
              <Plus className="h-4 w-4" />
              Tạo thiết bị
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Tìm theo tên hoặc mã thiết bị..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'Tất cả danh mục' },
                ...categories.map((c) => ({ value: c.name, label: c.name })),
              ]}
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
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={items} rowKey={(row) => row.equipmentItemId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <EquipmentFormModal
        isOpen={!!formModal}
        mode={formModal?.mode ?? 'create'}
        item={formModal?.item}
        categories={categories}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={(values) => {
          if (formModal?.mode === 'edit' && formModal.item) {
            handleEditSubmit(values, formModal.item);
          } else {
            handleCreateSubmit(values);
          }
        }}
      />

      <EquipmentDetailModal isOpen={!!detailItem} item={detailItem} onClose={() => setDetailItem(null)} />
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
