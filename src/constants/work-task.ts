// UC 2.14, 2.15 (docs/api/10-survey-assignment.md) — WorkTask.taskCategory/status
// ⚠️ Khớp theo schema thật (xem docs/more-require.md mục bb) — không phải taskType/status cũ.
export const TASK_CATEGORY_LABEL: Record<string, string> = {
  survey: 'Khảo sát',
  operation: 'Vận hành thi công',
};

export const TASK_STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  assigned: 'Đã giao việc',
  in_progress: 'Đang thực hiện',
  done: 'Hoàn thành',
};

export function humanizeTaskCategory(taskCategory: string): string {
  return TASK_CATEGORY_LABEL[taskCategory] ?? taskCategory.replaceAll('_', ' ');
}
