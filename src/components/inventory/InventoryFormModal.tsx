'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { EquipmentItem } from '@/types/equipment';
import type { InventoryRow } from '@/types/inventory';

export interface InventoryFormValues {
  equipmentItemId: string;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
}

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  row?: InventoryRow | null;
  equipmentItems: EquipmentItem[];
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: InventoryFormValues) => void;
}

const EMPTY_VALUES: InventoryFormValues = {
  equipmentItemId: '',
  availableQuantity: 0,
  reservedQuantity: 0,
  damagedQuantity: 0,
};

export function InventoryFormModal({
  isOpen,
  onClose,
  mode,
  row,
  equipmentItems,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<InventoryFormModalProps>) {
  const [values, setValues] = useState<InventoryFormValues>(EMPTY_VALUES);
  const [validationError, setValidationError] = useState('');
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setValidationError('');
      setValues(
        mode === 'edit' && row
          ? {
              equipmentItemId: row.equipmentItemId,
              availableQuantity: row.availableQuantity,
              reservedQuantity: row.reservedQuantity,
              damagedQuantity: row.damagedQuantity,
            }
          : EMPTY_VALUES
      );
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'create' && !values.equipmentItemId) {
      setValidationError('Vui lòng chọn thiết bị');
      return;
    }
    const quantities = [values.availableQuantity, values.reservedQuantity, values.damagedQuantity];
    if (quantities.some((quantity) => quantity < 0)) {
      setValidationError('Số lượng không được âm');
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
        {mode === 'create' ? 'Thêm tồn kho' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Thêm bản ghi tồn kho' : 'Sửa tồn kho'}
      footer={footer}
    >
      <form id="inventory-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Thiết bị"
          required
          disabled={mode === 'edit'}
          value={values.equipmentItemId}
          onChange={(e) => setValues((v) => ({ ...v, equipmentItemId: e.target.value }))}
          options={equipmentItems.map((item) => ({ value: item.equipmentItemId, label: item.name }))}
          placeholder="Chọn thiết bị"
          helpText={mode === 'edit' ? 'Không thể đổi thiết bị sau khi tạo' : undefined}
        />
        <Input
          label="Có sẵn"
          type="number"
          min={0}
          required
          value={values.availableQuantity}
          onChange={(e) => setValues((v) => ({ ...v, availableQuantity: Number(e.target.value) }))}
        />
        {mode === 'edit' && (
          <>
            <Input
              label="Đã giữ chỗ"
              type="number"
              min={0}
              value={values.reservedQuantity}
              onChange={(e) => setValues((v) => ({ ...v, reservedQuantity: Number(e.target.value) }))}
            />
            <Input
              label="Hỏng"
              type="number"
              min={0}
              value={values.damagedQuantity}
              onChange={(e) => setValues((v) => ({ ...v, damagedQuantity: Number(e.target.value) }))}
            />
          </>
        )}

        {(validationError || errorMessage) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-600/20">
            {validationError || errorMessage}
          </p>
        )}
      </form>
    </Modal>
  );
}

export default InventoryFormModal;
