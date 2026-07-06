// UC 2.14, 2.15 (docs/api/10-survey-assignment.md)
// ⚠️ Đã sửa lại theo schema thật (D:\bnwems-backend-api\prisma\schema.prisma model WorkTask) —
// KHÔNG khớp docs/api/10-survey-assignment.md lẫn field cũ của type này. Xem docs/more-require.md
// mục (bb) để biết chi tiết + đề xuất đồng bộ lại doc/backend.
// - Không có `scheduledStart`/`scheduledEnd` — model không có cột thời gian nào cả. Thời gian/địa
//   điểm dự kiến nằm ở `GET /api/v1/schedules` (đã triển khai) qua controller wrap taskService,
//   trả về `scheduledStart/End` lấy từ WorkTask.description JSON hoặc fallback createdAt/updatedAt.
// - Field phân loại thật là `taskCategory` ('survey' | 'operation'), không phải `taskType` như doc.
// - `status` thật có 4 giá trị: 'draft' | 'assigned' | 'in_progress' | 'done' (không phải
//   'pending'|'in_progress'|'completed' như type cũ khai).
// - Có thêm `title`, `description`, `progressPercent`, `scheduleId`, `createdAt`/`updatedAt`.
export type WorkTaskCategory = 'survey' | 'operation';
export type WorkTaskStatus = 'draft' | 'assigned' | 'in_progress' | 'done';

// GET /api/v1/tasks
export interface WorkTask {
  workTaskId: string;
  orderId: string;
  scheduleId: string | null;
  taskCategory: WorkTaskCategory;
  title: string;
  description: string | null;
  status: WorkTaskStatus;
  progressPercent: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
