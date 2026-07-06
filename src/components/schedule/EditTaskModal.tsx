'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { workTaskApiService } from '@/services/workTask.service';
import type { WorkTask } from '@/types/workTask';

interface EditTaskModalProps {
  isOpen: boolean;
  task: WorkTask | null;
  onClose: () => void;
  onUpdated: () => void;
}

// PUT /api/v1/tasks/:id chỉ cho sửa khi task đang draft, và chỉ nhận scheduledStart/End/location
// (không đổi được title/taskCategory sau khi tạo). Xem docs/more-require.md mục (bb).
export default function EditTaskModal({ isOpen, task, onClose, onUpdated }: Readonly<EditTaskModalProps>) {
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form khi mở modal, không phải vòng lặp render
    setScheduledStart('');
    setScheduledEnd('');
    setLocation('');
    setError(null);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!task) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await workTaskApiService.updateTask(task.workTaskId, {
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : undefined,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : undefined,
        location: location.trim() || undefined,
      });
      onUpdated();
      onClose();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? 'Không thể cập nhật công việc. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa công việc"
      subtitle={task.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Chỉ chỉnh sửa được thời gian/địa điểm dự kiến — không đổi được loại công việc hay tiêu đề sau khi tạo.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input type="datetime-local" label="Bắt đầu dự kiến" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} />
          <Input type="datetime-local" label="Kết thúc dự kiến" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} />
        </div>
        <Input label="Địa điểm" value={location} onChange={(e) => setLocation(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
