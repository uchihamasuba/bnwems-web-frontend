'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { supplierApiService } from '@/services/supplier.service';

const SERVICE_CATEGORY_OPTIONS = [
  { value: '', label: '— Chọn danh mục —' },
  { value: 'Hoa tươi & trang trí', label: 'Hoa tươi & trang trí' },
  { value: 'Âm thanh & ánh sáng', label: 'Âm thanh & ánh sáng' },
  { value: 'Thiết bị sự kiện', label: 'Thiết bị sự kiện' },
  { value: 'Trang trí tiệc cưới', label: 'Trang trí tiệc cưới' },
  { value: 'Phương tiện vận chuyển', label: 'Phương tiện vận chuyển' },
  { value: 'Khác', label: 'Khác' },
];

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSupplierModal({ isOpen, onClose, onSuccess }: Readonly<AddSupplierModalProps>) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setServiceCategory('');
    setErrors({});
    setSubmitError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập tên nhà cung cấp';
    if (!phone.trim()) errs.phone = 'Vui lòng nhập số điện thoại';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await supplierApiService.createSupplier({ name, contactPerson, phone, email, address, serviceCategory });
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Thêm nhà cung cấp thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Thêm nhà cung cấp mới">
      <div className="space-y-4 p-1">
        <Input
          label="Tên nhà cung cấp"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: Công ty Hoa tươi Đà Lạt"
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Người liên hệ"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="Họ và tên"
          />
          <Input
            label="Số điện thoại"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxxx"
            error={errors.phone}
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="supplier@gmail.com"
        />
        <Input
          label="Địa chỉ trụ sở"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Danh mục dịch vụ</label>
          <Select
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
            options={SERVICE_CATEGORY_OPTIONS}
          />
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-200">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Thêm nhà cung cấp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
