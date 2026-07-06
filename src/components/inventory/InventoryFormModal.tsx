'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CatalogItem } from '@/types/catalog';
import type { InventoryRow, InventoryAdjustmentType } from '@/types/inventory';

export interface InventoryFormValues {
  catalogItemId: string;
  adjustmentType: InventoryAdjustmentType;
  quantity: number;
  reason: string;
}

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  row?: InventoryRow | null; // If provided, pre-select this catalog item
  catalogItems: CatalogItem[];
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: InventoryFormValues) => void;
}

const EMPTY_VALUES: InventoryFormValues = {
  catalogItemId: '',
  adjustmentType: 'IMPORT',
  quantity: 0,
  reason: '',
};

export function InventoryFormModal({
  isOpen,
  onClose,
  row,
  catalogItems,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<InventoryFormModalProps>) {
  const [values, setValues] = useState<InventoryFormValues>(EMPTY_VALUES);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValidationError('');
      setValues({
        catalogItemId: row ? row.catalogItemId : '',
        adjustmentType: 'IMPORT',
        quantity: 0,
        reason: '',
      });
    }
  }, [isOpen, row]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.catalogItemId) {
      setValidationError('Vui lòng chọn thiết bị');
      return;
    }
    if (values.quantity <= 0) {
      setValidationError('Số lượng phải lớn hơn 0');
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
      <Button type="submit" form="inventory-form" isLoading={isSubmitting}>
        Điều chỉnh kho
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Điều chỉnh kho"
      footer={footer}
    >
      <form id="inventory-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Thiết bị"
          required
          disabled={!!row}
          value={values.catalogItemId}
          onChange={(e) => setValues((v) => ({ ...v, catalogItemId: e.target.value }))}
          options={catalogItems.map((item) => ({ value: item.id, label: item.name }))}
          placeholder="Chọn thiết bị"
        />
        <Select
          label="Loại điều chỉnh"
          required
          value={values.adjustmentType}
          onChange={(e) => setValues((v) => ({ ...v, adjustmentType: e.target.value as InventoryAdjustmentType }))}
          options={[
            { value: 'IMPORT', label: 'Nhập kho (IMPORT)' },
            { value: 'EXPORT', label: 'Xuất kho (EXPORT)' },
            { value: 'DAMAGED', label: 'Báo hỏng (DAMAGED)' },
            { value: 'LOST', label: 'Báo mất (LOST)' },
            { value: 'FOUND', label: 'Tìm thấy (FOUND)' },
          ]}
        />
        <Input
          label="Số lượng"
          type="number"
          min={1}
          required
          value={values.quantity}
          onChange={(e) => setValues((v) => ({ ...v, quantity: Number(e.target.value) }))}
        />
        <Input
          label="Lý do"
          type="text"
          value={values.reason}
          onChange={(e) => setValues((v) => ({ ...v, reason: e.target.value }))}
          placeholder="Nhập lý do điều chỉnh..."
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
