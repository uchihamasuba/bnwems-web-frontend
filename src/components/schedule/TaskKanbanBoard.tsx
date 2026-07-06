'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Loader2 } from 'lucide-react';
import { workTaskApiService } from '@/services/workTask.service';
import { Badge } from '@/components/ui/Badge';
import AssignTaskStaffModal from '@/components/schedule/AssignTaskStaffModal';
import { TASK_CATEGORY_LABEL, TASK_STATUS_LABEL } from '@/constants/work-task';
import type { WorkTask, WorkTaskStatus } from '@/types/workTask';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

const STATUS_COLUMNS: WorkTaskStatus[] = ['draft', 'assigned', 'in_progress', 'done'];

const NEXT_STATUS: Record<WorkTaskStatus, Exclude<WorkTaskStatus, 'draft'> | null> = {
  draft: 'assigned',
  assigned: 'in_progress',
  in_progress: 'done',
  done: null,
};

export interface TaskKanbanBoardProps {
  tasks: WorkTask[];
  orderById: Map<string, Order>;
  customerById: Map<string, Customer>;
  onRefresh: () => void | Promise<void>;
}

export default function TaskKanbanBoard({ tasks, orderById, customerById, onRefresh }: Readonly<TaskKanbanBoardProps>) {
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);
  const [assigningTask, setAssigningTask] = useState<WorkTask | null>(null);

  const columns: Record<WorkTaskStatus, WorkTask[]> = { draft: [], assigned: [], in_progress: [], done: [] };
  for (const task of tasks) {
    (columns[task.status] ?? columns.draft).push(task);
  }

  const handleAdvance = async (task: WorkTask) => {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    setMovingTaskId(task.workTaskId);
    try {
      await workTaskApiService.updateTaskProgress(task.workTaskId, { status: next });
      await onRefresh();
    } finally {
      setMovingTaskId(null);
    }
  };

  const handleCancel = async (task: WorkTask) => {
    if (!confirm(`Xóa công việc "${task.title}" khỏi hệ thống?`)) return;
    setMovingTaskId(task.workTaskId);
    try {
      await workTaskApiService.cancelTask(task.workTaskId, 'deleted');
      await onRefresh();
    } finally {
      setMovingTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {STATUS_COLUMNS.map((status, colIdx) => (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.25, delay: colIdx * 0.05 }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{TASK_STATUS_LABEL[status]}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-xs">{columns[status].length}</span>
          </div>

          <div className="space-y-3">
            {columns[status].length === 0 && <p className="px-1 text-xs text-slate-400">Không có công việc nào.</p>}
            {columns[status].map((task) => {
              const order = orderById.get(task.orderId);
              const customer = order ? customerById.get(order.customerId) : undefined;
              const next = NEXT_STATUS[task.status];
              const isBusy = movingTaskId === task.workTaskId;
              return (
                <div key={task.workTaskId} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug text-slate-800">{task.title}</p>
                    <Badge variant={task.taskCategory === 'survey' ? 'info' : 'neutral'}>{TASK_CATEGORY_LABEL[task.taskCategory]}</Badge>
                  </div>
                  <Link href={`/manager/orders/${task.orderId}`} className="mt-1.5 block truncate text-xs font-medium text-blue-600 hover:underline">
                    #{task.orderId} — {customer?.fullName ?? `KH #${order?.customerId ?? '—'}`}
                  </Link>

                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${task.progressPercent}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{task.progressPercent}% hoàn thành</p>

                  <div className="mt-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAssigningTask(task)}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100"
                    >
                      <UserPlus className="h-3 w-3" />
                      Phân công
                    </button>
                    {next && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAdvance(task)}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Chuyển sang &quot;{TASK_STATUS_LABEL[next]}&quot;
                      </button>
                    )}
                    {task.status === 'draft' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleCancel(task)}
                        aria-label="Xóa công việc"
                        title="Xóa công việc"
                        className="ml-auto rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}

      <AssignTaskStaffModal
        isOpen={Boolean(assigningTask)}
        task={assigningTask}
        onClose={() => setAssigningTask(null)}
        onAssigned={() => onRefresh()}
      />
    </div>
  );
}
