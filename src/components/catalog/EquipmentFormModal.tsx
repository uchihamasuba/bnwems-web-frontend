'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CatalogCategory } from '@/types/catalog';
import type { EquipmentItem } from '@/types/equipment';

export interface EquipmentFormValues {
  code: string;
  name: string;
  category: string;
  unit: string;
  rentalPrice: number;
  costPrice: number;
  replacementValue: number;
}

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  item?: EquipmentItem | null;
  categories: CatalogCategory[];
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: EquipmentFormValues) => void;
}

const EMPTY_VALUES: EquipmentFormValues = {
  code: '',
  name: '',
  category: '',
  unit: '',
  rentalPrice: 0,
  costPrice: 0,
  replacementValue: 0,
};

export function EquipmentFormModal({
  isOpen,
  onClose,
  mode,
  item,
  categories,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<EquipmentFormModalProps>) {
  const [values, setValues] = useState<EquipmentFormValues>(EMPTY_VALUES);
  const [validationError, setValidationError] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setValidationError('');
      setValues(
        mode === 'edit' && item
          ? {
              code: item.code,
              name: item.name,
              category: item.category,
              unit: item.unit,
              rentalPrice: item.rentalPrice,
              costPrice: item.costPrice,
              replacementValue: item.replacementValue,
            }
          : EMPTY_VALUES
      );
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (values.rentalPrice <= 0 || values.replacementValue <= 0) {
      setValidationError('Giá thuê và giá trị đền bù phải lớn hơn 0');
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
      <Button type="submit" form="equipment-form" isLoading={isSubmitting}>
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
      <form id="equipment-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Mã thiết bị"
          required
          disabled={mode === 'edit'}
          value={values.code}
          onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
          helpText={mode === 'edit' ? 'Không thể đổi mã sau khi tạo' : undefined}
        />
        <Input
          label="Tên thiết bị"
          required
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Select
          label="Danh mục"
          required
          value={values.category}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
          options={categories.map((c) => ({ value: c.name, label: c.name }))}
          placeholder="Chọn danh mục"
        />
        <Input
          label="Đơn vị tính"
          required
          placeholder="VD: bộ, cái, chiếc"
          value={values.unit}
          onChange={(e) => setValues((v) => ({ ...v, unit: e.target.value }))}
        />
        <Input
          label="Giá thuê"
          type="number"
          min={0}
          required
          value={values.rentalPrice}
          onChange={(e) => setValues((v) => ({ ...v, rentalPrice: Number(e.target.value) }))}
        />
        <Input
          label="Giá vốn"
          type="number"
          min={0}
          required
          value={values.costPrice}
          onChange={(e) => setValues((v) => ({ ...v, costPrice: Number(e.target.value) }))}
        />
        <Input
          label="Giá trị đền bù"
          type="number"
          min={0}
          required
          value={values.replacementValue}
          onChange={(e) => setValues((v) => ({ ...v, replacementValue: Number(e.target.value) }))}
          helpText="Dùng để tính đền bù khi thiết bị hỏng/mất"
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

export default EquipmentFormModal;
