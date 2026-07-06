'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { userApiService } from '@/services/user.service';
import { assignmentApiService } from '@/services/assignment.service';
import { EXECUTION_ROLE_OPTIONS, SURVEY_ROLE } from '@/components/orders/surveyPersonnel.constants';
import type { AdminUser } from '@/types/user';
import type { WorkTask } from '@/types/workTask';

interface AssignTaskStaffModalProps {
  isOpen: boolean;
  task: WorkTask | null;
  onClose: () => void;
  onAssigned: () => void;
}

const STAFF_ROLES = new Set(['LEADER_STAFF', 'TECHNICAL_STAFF']);

export default function AssignTaskStaffModal({ isOpen, task, onClose, onAssigned }: Readonly<AssignTaskStaffModalProps>) {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = task?.taskCategory === 'survey' ? [SURVEY_ROLE] : EXECUTION_ROLE_OPTIONS;

  useEffect(() => {
    if (!isOpen || !task) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset form state khi mở modal, không phải vòng lặp render
    setError(null);
    setUserId('');
    setRole(task.taskCategory === 'survey' ? SURVEY_ROLE : EXECUTION_ROLE_OPTIONS[0]);
    userApiService
      .getUsers({ limit: 100 })
      .then((res) => setStaff((res.data ?? []).filter((u: AdminUser) => STAFF_ROLES.has(u.role))))
      .catch(() => setStaff([]));
  }, [isOpen, task]);

  const handleSubmit = async () => {
    if (!task || !userId || !role) {
      setError('Vui lòng chọn nhân sự và vai trò.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await assignmentApiService.assignStaff(task.workTaskId, { assignments: [{ userId, assignedRole: role }] });
      onAssigned();
      onClose();
    } catch {
      setError('Không thể phân công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phân công nhân sự"
      subtitle={task.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Phân công
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Nhân sự"
          required
          placeholder="Chọn nhân sự"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          options={staff.map((u) => ({ value: u.id, label: `${u.fullName} (${u.username})` }))}
        />
        <Select
          label="Vai trò"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={roleOptions.map((r) => ({ value: r, label: r }))}
        />
        {staff.length === 0 && <p className="text-xs text-amber-600">Không tải được danh sách nhân sự.</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
