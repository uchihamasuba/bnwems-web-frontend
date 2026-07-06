'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { workTaskApiService } from '@/services/workTask.service';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ⚠️ Backend thật (task.service.ts createTask) ghi `title: taskType` và chỉ đặc cách
// `taskCategory: 'survey'` khi taskType === chuỗi chính xác 'survey' — nghĩa là task khảo sát tạo
// qua API này LUÔN có title hiển thị đúng là "survey" (không thể đặt tiêu đề đẹp riêng cho khảo
// sát). Với "Vận hành thi công", toàn bộ text nhập vào ô tiêu đề được gửi thẳng làm taskType, vừa
// là title vừa quyết định taskCategory = 'operation'. Xem docs/more-require.md mục (bb).
export default function CreateTaskModal({ isOpen, onClose, onCreated }: Readonly<CreateTaskModalProps>) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderId, setOrderId] = useState('');
  const [category, setCategory] = useState<'survey' | 'operation'>('operation');
  const [title, setTitle] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form khi mở modal, không phải vòng lặp render
    setOrderId('');
    setCategory('operation');
    setTitle('');
    setScheduledStart('');
    setScheduledEnd('');
    setLocation('');
    setError(null);
    orderApiService.getOrders({ limit: 200 }).then((res) => setOrders(res.data ?? []));
    customerApiService.getCustomers({ limit: 200 }).then((res) => setCustomers(res.data ?? []));
  }, [isOpen]);

  const customerById = new Map(customers.map((c) => [c.customerId, c]));
  const orderOptions = orders.map((o) => ({
    value: o.orderId,
    label: `#${o.orderId} — ${customerById.get(o.customerId)?.fullName ?? `KH #${o.customerId}`}`,
  }));

  const handleSubmit = async () => {
    if (!orderId) {
      setError('Vui lòng chọn đơn hàng.');
      return;
    }
    if (category === 'operation' && !title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc.');
      return;
    }
    if (!scheduledStart || !scheduledEnd) {
      setError('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await workTaskApiService.createTask(orderId, {
        taskType: category === 'survey' ? 'survey' : title.trim(),
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        location: location.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? 'Không thể tạo công việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo công việc mới"
      subtitle="Giao việc khảo sát hoặc vận hành thi công cho một đơn hàng."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Tạo công việc
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Đơn hàng liên kết"
          required
          placeholder="-- Chọn đơn hàng --"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          options={orderOptions}
        />

        <Select
          label="Loại công việc"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as 'survey' | 'operation')}
          options={[
            { value: 'operation', label: 'Vận hành thi công' },
            { value: 'survey', label: 'Khảo sát' },
          ]}
        />

        {category === 'operation' ? (
          <Input
            label="Tiêu đề công việc"
            required
            placeholder="Vd: Chuẩn bị & xuất kho, Thi công lắp đặt, Thu hồi..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Công việc khảo sát dùng tiêu đề mặc định của hệ thống, không đặt được tiêu đề tùy chỉnh.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="datetime-local"
            label="Bắt đầu dự kiến"
            required
            value={scheduledStart}
            onChange={(e) => setScheduledStart(e.target.value)}
          />
          <Input
            type="datetime-local"
            label="Kết thúc dự kiến"
            required
            value={scheduledEnd}
            onChange={(e) => setScheduledEnd(e.target.value)}
          />
        </div>

        <Input label="Địa điểm (nếu khác địa điểm sự kiện)" value={location} onChange={(e) => setLocation(e.target.value)} />

        <p className="text-xs italic text-slate-400">
          Ghi chú: thời gian/địa điểm nhập ở đây được backend lưu tạm trong mô tả nội bộ — hệ thống
          hiện chưa có cách đọc lại để hiển thị trên lịch (xem docs/more-require.md mục bb). Lịch bên
          dưới vẫn hiển thị theo ngày tạo công việc.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
