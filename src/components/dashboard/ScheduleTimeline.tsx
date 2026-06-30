'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import type { WorkTask } from '@/types/workTask';
import type { Order } from '@/types/order';

const TASK_TYPE_LABEL: Record<string, string> = {
  preparation: 'Chuẩn bị',
  installation: 'Thi công / Lắp đặt',
  transport: 'Vận chuyển',
  collection: 'Thu hồi',
};

const TASK_STATUS_LABEL: Record<string, string> = {
  pending: 'Chưa bắt đầu',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
};

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function humanize(text: string): string {
  return text.replaceAll('_', ' ');
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function getMonthGrid(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const lastOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const endOffset = 6 - ((lastOfMonth.getDay() + 6) % 7);
  const gridStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1 - startOffset);
  const totalDays = startOffset + lastOfMonth.getDate() + endOffset;

  return Array.from(
    { length: totalDays },
    (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
  );
}

function timelineDotColor(task: WorkTask, isDelayed: boolean): string {
  if (isDelayed) return 'bg-red-500';
  if (task.status === 'in_progress') return 'bg-blue-600';
  if (task.status === 'completed') return 'bg-blue-300';
  return 'bg-slate-300';
}

/** % thời gian đã trôi qua trong khung giờ công việc — dùng cho progress bar. */
function taskProgress(task: WorkTask): number {
  if (task.status === 'completed') return 1;
  if (task.status === 'pending') return 0;
  const start = new Date(task.scheduledStart).getTime();
  const end = new Date(task.scheduledEnd).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}

export interface ScheduleTimelineProps {
  viewDate: Date;
  selectedDate: Date;
  onViewDateChange: (date: Date) => void;
  onSelectedDateChange: (date: Date) => void;
  tasks: WorkTask[];
  alertedTaskIds: Set<string>;
  orderById: Map<string, Order>;
  scheduleHref: string;
}

export default function ScheduleTimeline({
  viewDate,
  selectedDate,
  onViewDateChange,
  onSelectedDateChange,
  tasks,
  alertedTaskIds,
  orderById,
  scheduleHref,
}: Readonly<ScheduleTimelineProps>) {
  const monthGrid = getMonthGrid(viewDate);
  const monthLabel = viewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const selectedDateLabel = selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' });
  const tasksOnSelectedDate = tasks.filter((t) => isSameDay(new Date(t.scheduledStart), selectedDate));
  const datesWithTasks = new Set(tasks.map((t) => new Date(t.scheduledStart).toDateString()));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Lịch trình &amp; Lịch sự kiện</h3>
          <p className="mt-0.5 text-sm text-slate-400">Công việc theo ngày</p>
        </div>
        <Link
          href={scheduleHref}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
        >
          Xem lịch trình
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mini calendar — chiếm nửa trái, cân với timeline bên phải */}
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold capitalize text-slate-700">{monthLabel}</span>
            <button
              type="button"
              onClick={() => onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 hover:bg-slate-100"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAY_LABELS.map((d) => (
              <span key={d} className="text-xs text-slate-400">
                {d}
              </span>
            ))}
            {monthGrid.map((date) => {
              const inMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = isSameDay(date, selectedDate);
              const hasTasks = datesWithTasks.has(date.toDateString());
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => onSelectedDateChange(date)}
                  className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-600 font-semibold text-white shadow-sm'
                      : inMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {date.getDate()}
                  {hasTasks && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Larger timeline — primary focus */}
        <div className="border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <h4 className="mb-4 border-b border-slate-100 pb-2 text-sm font-semibold capitalize text-slate-700">
            {selectedDateLabel}
          </h4>
          {tasksOnSelectedDate.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Không có công việc nào trong ngày này.</p>
          ) : (
            <div className="relative flex flex-col gap-5 before:absolute before:bottom-1 before:left-[13px] before:top-1 before:w-px before:bg-slate-200">
              {tasksOnSelectedDate.map((task, index) => {
                const order = orderById.get(task.orderId);
                const isDelayed = alertedTaskIds.has(task.workTaskId);
                const isActive = task.status === 'in_progress';
                const dotColor = timelineDotColor(task, isDelayed);
                const progress = taskProgress(task);
                return (
                  <motion.div
                    key={task.workTaskId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative flex gap-4"
                  >
                    <span
                      className={`z-10 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-white ${dotColor}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                    <div
                      className={`flex-1 rounded-xl border p-4 transition-colors duration-150 ${
                        isActive ? 'border-blue-100 bg-blue-50' : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-base font-semibold text-slate-800">
                          {TASK_TYPE_LABEL[task.taskType] ?? humanize(task.taskType)}
                        </span>
                        <span className="flex-shrink-0 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-100">
                          {formatTime(task.scheduledStart)} - {formatTime(task.scheduledEnd)}
                        </span>
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                        <ClipboardList className="h-3 w-3 flex-shrink-0" />
                        Đơn #{order?.orderId ?? task.orderId}
                      </p>

                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 0.4 }}
                          className={`h-full rounded-full ${isDelayed ? 'bg-red-500' : 'bg-blue-600'}`}
                        />
                      </div>

                      <div className="mt-2.5">
                        {isDelayed ? (
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
                            Bị trễ
                          </span>
                        ) : (
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
                            {TASK_STATUS_LABEL[task.status] ?? task.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
