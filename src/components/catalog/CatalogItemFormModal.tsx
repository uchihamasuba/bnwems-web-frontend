'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CatalogCategory, CatalogItem, CatalogItemType } from '@/types/catalog';

export interface CatalogItemFormValues {
  name: string;
  description: string;
  itemType: CatalogItemType;
  basePrice: number;
  categoryId: string | null;
}

interface CatalogItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  item?: CatalogItem | null;
  categories: CatalogCategory[];
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: CatalogItemFormValues) => void;
}

const EMPTY_VALUES: CatalogItemFormValues = {
  name: '',
  description: '',
  itemType: 'EQUIPMENT',
  basePrice: 0,
  categoryId: null,
};

const ITEM_TYPE_OPTIONS = [
  { value: 'EQUIPMENT', label: 'Thiết bị' },
  { value: 'SERVICE', label: 'Dịch vụ' },
  { value: 'MATERIAL', label: 'Vật tư' },
  { value: 'PACKAGE', label: 'Gói' },
];

export function CatalogItemFormModal({
  isOpen,
  onClose,
  mode,
  item,
  categories,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<CatalogItemFormModalProps>) {
  const [values, setValues] = useState<CatalogItemFormValues>(EMPTY_VALUES);
  const [validationError, setValidationError] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setValidationError('');
      setValues(
        mode === 'edit' && item
          ? {
              name: item.name,
              description: item.description ?? '',
              itemType: item.itemType,
              basePrice: item.basePrice,
              categoryId: item.categoryId,
            }
          : EMPTY_VALUES
      );
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (values.basePrice <= 0) {
      setValidationError('Đơn giá phải lớn hơn 0');
      return;
    }
    setValidationError('');
    onSubmit(values);
  };

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={onClose}>
        Hủy
      </Button>
      <Button type="submit" form="catalog-item-form" isLoading={isSubmitting}>
        {mode === 'create' ? 'Tạo thiết bị' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Tạo thiết bị mới' : 'Chỉnh sửa thiết bị'}
      footer={footer}
    >
      <form id="catalog-item-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Tên thiết bị"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Select
          label="Loại"
          required
          disabled={mode === 'edit'}
          value={values.itemType}
          onChange={(e) => setValues((v) => ({ ...v, itemType: e.target.value as CatalogItemType }))}
          options={ITEM_TYPE_OPTIONS}
          helpText={mode === 'edit' ? 'Không thể đổi loại sau khi tạo' : undefined}
        />
        <Input
          label="Mô tả"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        />
        <Input
          label="Đơn giá"
          type="number"
          min={0}
          required
          value={values.basePrice}
          onChange={(e) => setValues((v) => ({ ...v, basePrice: Number(e.target.value) }))}
        />
        <Select
          label="Danh mục"
          value={values.categoryId ?? ''}
          onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value || null }))}
          options={[{ value: '', label: 'Không có danh mục' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
        />

        {(validationError || errorMessage) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-600/20">
            {validationError || errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default CatalogItemFormModal;
