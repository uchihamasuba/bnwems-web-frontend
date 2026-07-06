'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/utils/formatDate';
import { orderApiService } from '@/services/order.service';
import { EVENT_TYPES } from '@/constants/order-event-type';
import type { OrderDetail } from '@/types/order';

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((t) => ({ value: t, label: t }));

interface EditOrderModalProps {
  isOpen: boolean;
  order: OrderDetail;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditOrderModal({ isOpen, order, customerName, onClose, onSuccess }: Readonly<EditOrderModalProps>) {
  const [eventType, setEventType] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestCount, setGuestCount] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEventType(order.eventType ?? '');
    setEventEndDate(order.eventEndDate ? new Date(order.eventEndDate).toISOString().slice(0, 10) : '');
    setVenueAddress(order.eventLocation ?? '');
    setGuestCount(order.guestCount != null ? String(order.guestCount) : '');
    setErrors({});
    setSubmitError(null);
  }, [isOpen, order]);

  const resetAndClose = () => {
    setSubmitError(null);
    setErrors({});
    onClose();
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!venueAddress.trim()) next.venueAddress = 'Vui lòng nhập địa điểm tổ chức';
    if (guestCount && Number(guestCount) < 1) next.guestCount = 'Số lượng khách phải lớn hơn 0';
    return next;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await orderApiService.updateOrder(order.orderId, {
        venueAddress: venueAddress.trim(),
        ...(eventType ? { eventType } : {}),
        ...(eventEndDate ? { eventEndDate: new Date(eventEndDate).toISOString() } : {}),
        ...(guestCount ? { guestCount: Number(guestCount) } : {}),
      });
      onSuccess();
      resetAndClose();
    } catch {
      setSubmitError('Không thể cập nhật đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Sửa đơn hàng"
      subtitle={`#${order.orderId} — ${customerName}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Khách hàng: <span className="font-semibold text-slate-700">{customerName}</span> — không thể đổi khách hàng liên
          kết sau khi tạo đơn.
        </div>

        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
          Ngày tổ chức: <span className="font-semibold text-slate-800">{formatDate(order.eventDate)}</span> — dùng nút
          &quot;Đổi ngày sự kiện&quot; để thay đổi.
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Loại sự kiện"
            placeholder="Chọn loại sự kiện"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            options={EVENT_TYPE_OPTIONS}
          />
          <Input
            type="date"
            label="Ngày kết thúc"
            value={eventEndDate}
            error={errors.eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
          />
          <Input
            type="number"
            label="Số lượng khách"
            min={1}
            placeholder="VD: 200"
            value={guestCount}
            error={errors.guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Tên địa điểm"
              required
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              value={venueAddress}
              error={errors.venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
            />
          </div>
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </div>
    </Modal>
  );
}
