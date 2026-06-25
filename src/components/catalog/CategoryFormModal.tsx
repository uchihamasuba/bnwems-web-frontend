'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CatalogCategory } from '@/types/catalog';

export interface CategoryFormValues {
  name: string;
  description: string;
  displayOrder: number;
  notes: string | null;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  category?: CatalogCategory | null;
  isSubmitting: boolean;
  errorMessage?: string;
  /** `isActive` chỉ có giá trị ở mode edit — thay đổi sẽ gọi riêng endpoint deactivate, không gửi qua PUT chính. */
  onSubmit: (values: CategoryFormValues, isActive?: boolean) => void;
}

const EMPTY_VALUES: CategoryFormValues = {
  name: '',
  description: '',
  displayOrder: 0,
  notes: null,
};

const textareaClassName =
  'block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã vô hiệu hóa' },
];

export function CategoryFormModal({
  isOpen,
  onClose,
  mode,
  category,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<CategoryFormModalProps>) {
  const [values, setValues] = useState<CategoryFormValues>(EMPTY_VALUES);
  const [isActive, setIsActive] = useState(true);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      if (mode === 'edit' && category) {
        setValues({
          name: category.name,
          description: category.description ?? '',
          displayOrder: category.displayOrder,
          notes: category.notes,
        });
        setIsActive(category.isActive);
      } else {
        setValues(EMPTY_VALUES);
        setIsActive(true);
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values, mode === 'edit' ? isActive : undefined);
  };

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={onClose}>
        Hủy
      </Button>
      <Button type="submit" form="category-form" isLoading={isSubmitting}>
        {mode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Tạo danh mục thiết bị' : 'Chỉnh sửa danh mục'}
      subtitle={mode === 'create' ? 'Thêm một danh mục mới để phân nhóm thiết bị.' : `Cập nhật danh mục "${category?.name ?? ''}".`}
      size="lg"
      footer={footer}
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin cơ bản</p>
          <div className="flex flex-col gap-4">
            <Input
              label="Tên danh mục"
              required
              placeholder="VD: Trang thiết bị âm thanh"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="category-description" className="text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                id="category-description"
                rows={3}
                className={textareaClassName}
                placeholder="Mô tả ngắn về danh mục này..."
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Thông tin vận hành</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Thứ tự hiển thị"
              type="number"
              min={0}
              value={values.displayOrder}
              onChange={(e) => setValues((v) => ({ ...v, displayOrder: Number(e.target.value) }))}
            />
            {mode === 'edit' && (
              <Select
                label="Trạng thái"
                value={String(isActive)}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                options={STATUS_OPTIONS}
              />
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Ghi chú nội bộ (không bắt buộc)</p>
          <textarea
            rows={2}
            className={textareaClassName}
            placeholder="Ghi chú hoặc tham chiếu nội bộ..."
            value={values.notes ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value || null }))}
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-600/20">
            {errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default CategoryFormModal;
