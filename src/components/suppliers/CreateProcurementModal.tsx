'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { procurementApiService } from '@/services/procurement.service';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Supplier } from '@/types/supplier';
import type { Order } from '@/types/order';

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Mua hàng' },
  { value: 'rental', label: 'Thuê ngoài' },
];

interface CreateProcurementModalProps {
  isOpen: boolean;
  suppliers: Supplier[];
  orders: Order[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProcurementModal({
  isOpen,
  suppliers,
  orders,
  onClose,
  onSuccess,
}: Readonly<CreateProcurementModalProps>) {
  const [supplierId, setSupplierId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [transactionType, setTransactionType] = useState<'purchase' | 'rental'>('purchase');
  const [itemDescription, setItemDescription] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSupplierId('');
    setOrderId('');
    setTransactionType('purchase');
    setItemDescription('');
    setTotalCost('');
    setDepositAmount('');
    setErrors({});
    setSubmitError(null);
  }, [isOpen]);

  const supplierOptions = [
    { value: '', label: '— Chọn nhà cung cấp —' },
    ...suppliers
      .filter((s) => s.status === 'active')
      .map((s) => ({ value: s.supplierId, label: s.name })),
  ];

  const orderOptions = [
    { value: '', label: '— Chọn đơn hàng liên kết —' },
    ...orders.map((o) => ({ value: o.orderId, label: `${o.orderId}` })),
  ];

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!supplierId) errs.supplierId = 'Vui lòng chọn nhà cung cấp';
    if (!orderId) errs.orderId = 'Vui lòng chọn đơn hàng';
    if (!itemDescription.trim()) errs.itemDescription = 'Vui lòng nhập hạng mục mua sắm';
    if (!totalCost || Number(totalCost) <= 0) errs.totalCost = 'Vui lòng nhập chi phí hợp lệ';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await procurementApiService.createTransaction({
        supplierId,
        orderId,
        transactionType,
        itemDescription,
        totalCost: Number(totalCost),
        depositAmount: Number(depositAmount || '0'),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Tạo đơn mua sắm thất bại, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Khởi tạo đơn mua sắm / Thuê NCC">
      <div className="space-y-4 p-1">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nhà cung cấp <span className="text-red-500">*</span>
          </label>
          <Select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={supplierOptions}
          />
          {errors.supplierId && <p className="mt-1 text-xs text-red-600">{errors.supplierId}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Đơn hàng liên kết <span className="text-red-500">*</span>
          </label>
          <Select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            options={orderOptions}
          />
          {errors.orderId && <p className="mt-1 text-xs text-red-600">{errors.orderId}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại giao dịch</label>
          <Select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as 'purchase' | 'rental')}
            options={TRANSACTION_TYPE_OPTIONS}
          />
        </div>

        <Input
          label="Hạng mục mua sắm / Thuê ngoài"
          required
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          placeholder="VD: Hoa hồng Ecuador Pink Floyd (cành)"
          error={errors.itemDescription}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Chi phí ước tính (đ)"
              required
              type="number"
              min={0}
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="15000000"
              error={errors.totalCost}
            />
            {totalCost && Number(totalCost) > 0 && (
              <p className="mt-1 text-xs text-slate-500">{formatCurrency(Number(totalCost))}</p>
            )}
          </div>
          <div>
            <Input
              label="Chi đặt cọc NCC (đ)"
              type="number"
              min={0}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="4500000"
            />
            {depositAmount && Number(depositAmount) > 0 && (
              <p className="mt-1 text-xs text-slate-500">{formatCurrency(Number(depositAmount))}</p>
            )}
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-inset ring-red-200">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Khởi tạo đơn mua sắm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
