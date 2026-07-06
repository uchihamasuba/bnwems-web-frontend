import { Wrench, ClipboardList, type LucideIcon } from 'lucide-react';
import type { WorkTaskStatus, WorkTaskCategory } from '@/types/workTask';
import type { FieldStatus } from '@/types/assignment';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Trạng thái cấp task (Theo dõi thi công) — khớp WorkTask.status thật (docs/more-require.md mục bb)
export const TASK_STATUS_META: Record<WorkTaskStatus, { label: string; variant: BadgeVariant }> = {
  done: { label: 'ĐÃ HOÀN THÀNH', variant: 'success' },
  in_progress: { label: 'ĐANG THỰC HIỆN', variant: 'info' },
  assigned: { label: 'ĐÃ GIAO VIỆC', variant: 'warning' },
  draft: { label: 'NHÁP', variant: 'neutral' },
};

// Trạng thái từng nhân sự tại hiện trường (Phân công nhân sự)
export const FIELD_STATUS_META: Record<FieldStatus, { label: string; variant: BadgeVariant }> = {
  completed: { label: 'ĐÃ HOÀN THÀNH', variant: 'success' },
  ready: { label: 'SẴN SÀNG', variant: 'success' },
  in_setup: { label: 'ĐANG SETUP', variant: 'info' },
  pending: { label: 'CHỜ', variant: 'warning' },
};

// taskCategory thật chỉ có 'survey'/'operation' (không còn phân loại giai đoạn chi tiết như
// transport/installation/collection) — nhãn hiển thị dùng luôn task.title (mô tả tự do, đã đủ chi
// tiết), icon chỉ phân biệt theo category. Xem docs/more-require.md mục (bb).
const CATEGORY_ICON: Record<WorkTaskCategory, LucideIcon> = {
  survey: ClipboardList,
  operation: Wrench,
};

export function taskCategoryIcon(taskCategory: string): LucideIcon {
  return CATEGORY_ICON[taskCategory as WorkTaskCategory] ?? Wrench;
}

// Vai trò gợi ý cho modal "+ Phân công" (thi công)
export const EXECUTION_ROLE_OPTIONS = [
  'Trưởng nhóm',
  'Kỹ thuật âm thanh',
  'Kỹ thuật ánh sáng',
  'Kỹ thuật chung',
];

export const SURVEY_ROLE = 'Khảo sát viên';
