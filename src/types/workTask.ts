// UC 2.14, 2.15 (docs/api/10-survey-assignment.md)

export type WorkTaskStatus = 'pending' | 'in_progress' | 'completed';

// GET /api/v1/tasks
export interface WorkTask {
  workTaskId: string;
  orderId: string;
  taskType: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: WorkTaskStatus;
}
