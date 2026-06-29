'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Customer } from '@/types/customer';

export interface CustomerFormValues {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  customer?: Customer | null;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: CustomerFormValues) => void;
}

const EMPTY_VALUES: CustomerFormValues = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
};

export function CustomerFormModal({
  isOpen,
  onClose,
  mode,
  customer,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Readonly<CustomerFormModalProps>) {
  const [values, setValues] = useState<CustomerFormValues>(EMPTY_VALUES);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setValues(
        mode === 'edit' && customer
          ? {
              fullName: customer.fullName,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
            }
          : EMPTY_VALUES
      );
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={onClose}>
        Hủy
      </Button>
      <Button type="submit" form="customer-form" isLoading={isSubmitting}>
        {mode === 'create' ? 'Thêm khách hàng' : 'Lưu thay đổi'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Thêm khách hàng mới' : 'Sửa thông tin khách hàng'}
      subtitle={mode === 'create' ? 'Nhập thông tin liên hệ của khách hàng.' : 'Cập nhật thông tin liên hệ.'}
      footer={footer}
    >
      <form id="customer-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          required
          value={values.fullName}
          onChange={(e) => setValues((prev) => ({ ...prev, fullName: e.target.value }))}
        />
        <Input
          label="Số điện thoại"
          required={mode === 'create'}
          disabled={mode === 'edit'}
          value={values.phone}
          onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
        />
        <Input
          label="Địa chỉ"
          value={values.address}
          onChange={(e) => setValues((prev) => ({ ...prev, address: e.target.value }))}
        />
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      </form>
    </Modal>
  );
}
