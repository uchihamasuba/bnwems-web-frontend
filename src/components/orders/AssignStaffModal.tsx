'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { userApiService } from '@/services/user.service';
import { assignmentApiService } from '@/services/assignment.service';
import { EXECUTION_ROLE_OPTIONS, SURVEY_ROLE } from './surveyPersonnel.constants';
import type { AdminUser } from '@/types/user';
import type { AssignmentMember } from '@/types/assignment';

type AssignMode = 'survey' | 'execution';

interface AssignStaffModalProps {
  isOpen: boolean;
  mode: AssignMode;
  taskId: string | null;
  onClose: () => void;
  onAssigned: (mode: AssignMode, member: AssignmentMember) => void;
}

const STAFF_ROLES = new Set(['LEADER_STAFF', 'TECHNICAL_STAFF']);

export default function AssignStaffModal({ isOpen, mode, taskId, onClose, onAssigned }: Readonly<AssignStaffModalProps>) {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    /* eslint-disable react-hooks/set-state-in-effect -- reset form state khi mở modal, không phải vòng lặp render */
    setError(null);
    setUserId('');
    setRole(mode === 'survey' ? SURVEY_ROLE : EXECUTION_ROLE_OPTIONS[0]);
    /* eslint-enable react-hooks/set-state-in-effect */
    userApiService
      .getUsers({ limit: 100 })
      .then((res) => {
        const list: AdminUser[] = (res.data ?? []).filter((u: AdminUser) => STAFF_ROLES.has(u.role));
        setStaff(list);
      })
      .catch(() => setStaff([]));
  }, [isOpen, mode]);

  const roleOptions = mode === 'survey' ? [SURVEY_ROLE] : EXECUTION_ROLE_OPTIONS;

  const handleSubmit = async () => {
    if (!taskId || !userId || !role) {
      setError('Vui lòng chọn nhân sự và vai trò.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await assignmentApiService.assignStaff(taskId, { assignments: [{ userId, assignedRole: role }] });
      const user = staff.find((u) => u.id === userId);
      onAssigned(mode, {
        userId,
        fullName: user?.fullName ?? userId,
        assignedRole: role,
        fieldStatus: 'pending',
      });
      onClose();
    } catch {
      setError('Không thể phân công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'survey' ? 'Đổi người khảo sát' : 'Phân công nhân sự thi công'}
      subtitle={mode === 'survey' ? 'Chọn khảo sát viên phụ trách đơn hàng.' : 'Thêm nhân sự vào ca thi công.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            {mode === 'survey' ? 'Cập nhật' : 'Phân công'}
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
