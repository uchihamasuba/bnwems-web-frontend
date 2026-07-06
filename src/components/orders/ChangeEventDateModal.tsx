'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/utils/formatDate';
import { orderApiService } from '@/services/order.service';
import type { OrderDetail } from '@/types/order';

interface ChangeEventDateModalProps {
  isOpen: boolean;
  order: OrderDetail;
  onClose: () => void;
  onSuccess: () => void;
}

// Quy tắc nghiệp vụ (CLAUDE.md — Đổi ngày): miễn phí nếu yêu cầu trước >3 ngày so với ngày lắp đặt
// hiện tại. Đây chỉ là banner tham khảo — backend (order.service.ts changeEventDate) hiện chưa tự
// động tính/áp phí đổi ngày (xem docs/more-require.md mục z), nên không hiển thị số tiền cụ thể.
function isWithinFreeChangeWindow(currentEventDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(currentEventDate);
  event.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysLeft > 3;
}

export default function ChangeEventDateModal({ isOpen, order, onClose, onSuccess }: Readonly<ChangeEventDateModalProps>) {
  const [newEventDate, setNewEventDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setNewEventDate('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!newEventDate) {
      setError('Vui lòng chọn ngày tổ chức mới.');
      return;
    }
    if (new Date(newEventDate) <= new Date(new Date().toDateString())) {
      setError('Ngày tổ chức mới phải ở tương lai.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await orderApiService.changeOrderDate(order.orderId, {
        newEventDate: new Date(newEventDate).toISOString(),
      });
      onSuccess();
      resetAndClose();
    } catch {
      setError('Không thể đổi ngày sự kiện. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFree = isWithinFreeChangeWindow(order.eventDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Đổi ngày sự kiện"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Xác nhận đổi ngày
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
          Ngày tổ chức hiện tại: <span className="font-semibold text-slate-800">{formatDate(order.eventDate)}</span>
        </div>

        <div
          className={`flex gap-2 rounded-lg p-3 text-xs font-medium leading-relaxed ${
            isFree ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <CalendarClock className="h-4 w-4 flex-shrink-0" />
          <span>
            {isFree
              ? 'Yêu cầu đổi ngày được thực hiện trước hơn 3 ngày so với ngày lắp đặt hiện tại — theo chính sách, sẽ được miễn phí.'
              : 'Yêu cầu đổi ngày trong vòng 3 ngày trước ngày lắp đặt hiện tại có thể phát sinh phí theo chính sách đổi ngày. Hệ thống chưa tự động tính phí này — Manager cần thỏa thuận thủ công với khách hàng.'}
          </span>
        </div>

        <Input type="date" label="Ngày tổ chức mới" required value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} />

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
