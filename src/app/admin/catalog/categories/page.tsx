'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Pencil, Ban, CheckCircle2, Plus, RotateCw } from 'lucide-react';
import { catalogApiService } from '@/services/catalog.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { CategoryFormModal, CategoryFormValues } from '@/components/catalog/CategoryFormModal';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/formatDate';
import type { CatalogCategory } from '@/types/catalog';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã vô hiệu hóa' },
];

export default function Page() {
  const { can } = usePermission();
  const canManage = can('master-data:manage');

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('');

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; category: CatalogCategory | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');

  const [refreshToken, setRefreshToken] = useState(0);
  const refetchCategories = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    catalogApiService
      .getCatalogCategories({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        isActive: statusFilter ? statusFilter === 'true' : undefined,
      })
      .then((res) => {
        setCategories(res.data);
        updatePagination({
          totalItems: res.meta.totalCount,
          totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)),
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, debouncedSearch, statusFilter, refreshToken]);

  const handleCreateSubmit = async (values: CategoryFormValues) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await catalogApiService.createCatalogCategory(values);
      setFormModal(null);
      refetchCategories();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Tạo danh mục thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditSubmit = async (values: CategoryFormValues, category: CatalogCategory, isActive?: boolean) => {
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await catalogApiService.updateCatalogCategory(category.id, values);
      if (isActive != null && isActive !== category.isActive) {
        await catalogApiService.updateCatalogCategoryStatus(category.id, { isActive });
      }
      setFormModal(null);
      refetchCategories();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật danh mục thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (category: CatalogCategory) => {
    const nextIsActive = !category.isActive;
    const confirmMessage = nextIsActive
      ? `Kích hoạt lại danh mục "${category.name}"?`
      : `Vô hiệu hóa danh mục "${category.name}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await catalogApiService.updateCatalogCategoryStatus(category.id, { isActive: nextIsActive });
      refetchCategories();
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    }
  };

  const columns: TableColumn<CatalogCategory>[] = [
    { key: 'id', label: 'Mã danh mục' },
    {
      key: 'name',
      label: 'Tên danh mục',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.name}</p>
          {row.description && <p className="text-xs text-slate-400">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'totalEquipment',
      label: 'Tổng thiết bị',
      render: (row) => `${row.totalEquipment} thiết bị`,
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.isActive ? 'ACTIVE' : 'INACTIVE')}>
          {row.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
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
          <Link
            href={`/admin/catalog/categories/${row.id}`}
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Eye className="h-4 w-4" />
          </Link>
          {canManage && (
            <>
              <button
                type="button"
                aria-label="Chỉnh sửa"
                title="Chỉnh sửa"
                onClick={() => setFormModal({ mode: 'edit', category: row })}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={row.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                title={row.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                onClick={() => handleToggleStatus(row)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                {row.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
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
          <h1 className="text-xl font-semibold text-slate-900">Quản lý danh mục thiết bị</h1>
          <p className="mt-1 text-sm text-slate-500">Phân nhóm thiết bị theo danh mục để dễ quản lý và tra cứu.</p>
        </div>
        {canManage && (
          <Button onClick={() => setFormModal({ mode: 'create', category: null })}>
            <Plus className="h-4 w-4" />
            Tạo danh mục
          </Button>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Tìm theo tên danh mục..."
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]}
            />
          </div>
          <button
            type="button"
            aria-label="Làm mới"
            title="Làm mới"
            onClick={refetchCategories}
            className="rounded-md border border-gray-300 bg-white p-2 text-slate-500 hover:bg-slate-50"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={categories} rowKey={(row) => row.id} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <CategoryFormModal
        isOpen={!!formModal}
        mode={formModal?.mode ?? 'create'}
        category={formModal?.category}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={(values, isActive) => {
          if (formModal?.mode === 'edit' && formModal.category) {
            handleEditSubmit(values, formModal.category, isActive);
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
