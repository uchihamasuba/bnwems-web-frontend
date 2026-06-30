import { Truck, Wrench, RotateCcw, ClipboardList, Circle, type LucideIcon } from 'lucide-react';
import type { WorkTaskStatus } from '@/types/workTask';
import type { FieldStatus } from '@/types/assignment';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Trạng thái cấp task (Theo dõi thi công)
export const TASK_STATUS_META: Record<WorkTaskStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: 'ĐÃ HOÀN THÀNH', variant: 'success' },
  in_progress: { label: 'ĐANG THỰC HIỆN', variant: 'info' },
  pending: { label: 'CHƯA BẮT ĐẦU', variant: 'neutral' },
};

// Trạng thái từng nhân sự tại hiện trường (Phân công nhân sự)
export const FIELD_STATUS_META: Record<FieldStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: 'ĐÃ HOÀN THÀNH', variant: 'success' },
  ready: { label: 'SẴN SÀNG', variant: 'success' },
  in_setup: { label: 'ĐANG SETUP', variant: 'info' },
  pending: { label: 'CHỜ', variant: 'warning' },
};

// taskType → nhãn giai đoạn + icon
const TASK_TYPE_META: Record<string, { label: string; Icon: LucideIcon }> = {
  transport: { label: 'Vận chuyển thiết bị', Icon: Truck },
  installation: { label: 'Lắp đặt & Setup', Icon: Wrench },
  collection: { label: 'Thu hồi & Hoàn trả', Icon: RotateCcw },
  preparation: { label: 'Chuẩn bị', Icon: ClipboardList },
};

export function taskTypeMeta(taskType: string): { label: string; Icon: LucideIcon } {
  return TASK_TYPE_META[taskType] ?? { label: taskType, Icon: Circle };
}

// Vai trò gợi ý cho modal "+ Phân công" (thi công)
export const EXECUTION_ROLE_OPTIONS = [
  'Trưởng nhóm',
  'Kỹ thuật âm thanh',
  'Kỹ thuật ánh sáng',
  'Kỹ thuật chung',
];

export const SURVEY_ROLE = 'Khảo sát viên';
