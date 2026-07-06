'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MapPin, Package } from 'lucide-react';
import SurveyResultCard from '@/components/orders/SurveyResultCard';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';
import type { WorkTask } from '@/types/workTask';
import type { SurveyReport } from '@/types/survey';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';

export interface SurveyRow {
  task: WorkTask;
  order?: Order;
  customer?: Customer;
  report: SurveyReport | null;
  surveyorName?: string;
  /**
   * Ngày khảo sát — MOCK, không phải dữ liệu thật. WorkTask thật không có cột ngày dự kiến; ngày
   * dự kiến thật nằm ở model Schedule riêng nhưng GET /schedules chưa được backend triển khai (501).
   * Xem docs/more-require.md mục (bb). Luôn hiển thị in nghiêng để phân biệt với dữ liệu thật.
   */
  mockSurveyDate: string;
}

interface SurveyReportDrawerProps {
  row: SurveyRow | null;
  onClose: () => void;
}

export default function SurveyReportDrawer({ row, onClose }: Readonly<SurveyReportDrawerProps>) {
  return (
    <AnimatePresence>
      {row && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <button type="button" className="flex-1 cursor-default" aria-label="Đóng" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2 }}
            className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hồ sơ khảo sát</span>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Đơn #{row.task.orderId}</h2>
                  {row.report ? <Badge variant="success">Đã nộp</Badge> : <Badge variant="warning">Chưa nộp</Badge>}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 p-5">
              <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Thông tin chung</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <p>
                    <span className="text-slate-400">Khách hàng:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {row.customer?.fullName ?? (row.order ? `KH #${row.order.customerId}` : '—')}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">Ngày khảo sát:</span>{' '}
                    <span className="font-semibold italic text-slate-800" title="Dữ liệu minh họa — chưa có API ngày khảo sát thật">
                      {formatDate(row.mockSurveyDate)}
                    </span>
                  </p>
                  <p className="col-span-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                    <span className="font-semibold text-slate-800">{row.order?.eventLocation ?? '—'}</span>
                  </p>
                </div>
              </div>

              <SurveyResultCard report={row.report} surveyorName={row.surveyorName} isLoading={false} />

              <div className="flex gap-2 border-t border-slate-100 pt-5">
                <Link
                  href={`/manager/orders/${row.task.orderId}`}
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  href="/manager/inventory/stock-status"
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  <Package className="h-4 w-4" />
                  Kiểm tra tồn kho
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
