'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { FIELD_STATUS_META } from './surveyPersonnel.constants';
import { formatDate, formatTime } from '@/utils/formatDate';
import type { AssignmentGroup } from '@/types/assignment';

interface SurveyAssignmentCardProps {
  group: AssignmentGroup | null;
  canManage: boolean;
  isLoading: boolean;
  onReassign: () => void;
}

export default function SurveyAssignmentCard({ group, canManage, isLoading, onReassign }: Readonly<SurveyAssignmentCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Phân công khảo sát</h3>
        {canManage && group && (
          <button
            type="button"
            onClick={onReassign}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Đổi người
          </button>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">Đang tải...</p>
        ) : !group ? (
          <p className="text-sm text-slate-500">Chưa phân công khảo sát.</p>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(group.scheduledStart)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(group.scheduledStart)} - {formatTime(group.scheduledEnd)}
              </span>
            </div>
            <div className="space-y-2">
              {group.members.map((m, idx) => (
                <div key={m.userId + idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.fullName} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.fullName}</p>
                      <p className="text-xs text-slate-400">{m.assignedRole}</p>
                    </div>
                  </div>
                  {m.fieldStatus && <Badge variant={FIELD_STATUS_META[m.fieldStatus].variant}>{FIELD_STATUS_META[m.fieldStatus].label}</Badge>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
