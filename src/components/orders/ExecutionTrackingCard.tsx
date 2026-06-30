import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import { Badge } from '@/components/ui/Badge';
import { TASK_STATUS_META, taskTypeMeta } from './surveyPersonnel.constants';
import type { WorkTask } from '@/types/workTask';

interface ExecutionTrackingCardProps {
  tasks: WorkTask[];
  isLoading: boolean;
}

function TaskList({ tasks }: Readonly<{ tasks: WorkTask[] }>) {
  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có công việc thi công nào cho đơn hàng này.</p>;
  }
  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const { label, Icon } = taskTypeMeta(task.taskType);
        const status = TASK_STATUS_META[task.status] ?? { label: task.status, variant: 'neutral' as const };
        return (
          <div key={task.workTaskId} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}

export default function ExecutionTrackingCard({ tasks, isLoading }: Readonly<ExecutionTrackingCardProps>) {
  return (
    <AnalyticsCard title="Theo dõi thi công">
      {isLoading ? <p className="text-sm text-slate-400">Đang tải...</p> : <TaskList tasks={tasks} />}
    </AnalyticsCard>
  );
}
