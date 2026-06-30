'use client';

import { useEffect, useState } from 'react';
import SurveyResultCard from './SurveyResultCard';
import ExecutionTrackingCard from './ExecutionTrackingCard';
import SurveyAssignmentCard from './SurveyAssignmentCard';
import ExecutionPersonnelCard from './ExecutionPersonnelCard';
import FieldChangeRequestCard from './FieldChangeRequestCard';
import AssignStaffModal from './AssignStaffModal';
import { workTaskApiService } from '@/services/workTask.service';
import { surveyApiService } from '@/services/survey.service';
import { assignmentApiService } from '@/services/assignment.service';
import { changeRequestApiService } from '@/services/changeRequest.service';
import type { WorkTask } from '@/types/workTask';
import type { SurveyReport } from '@/types/survey';
import type { AssignmentGroup, AssignmentMember, OrderAssignments } from '@/types/assignment';
import type { ChangeRequest } from '@/types/changeRequest';

interface SurveyPersonnelTabProps {
  orderId: string;
  canManage: boolean;
}

type AssignMode = 'survey' | 'execution';

export default function SurveyPersonnelTab({ orderId, canManage }: Readonly<SurveyPersonnelTabProps>) {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [surveyReport, setSurveyReport] = useState<SurveyReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(true);

  const [assignments, setAssignments] = useState<OrderAssignments | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [crSubmittingId, setCrSubmittingId] = useState<string | null>(null);

  const [modal, setModal] = useState<{ isOpen: boolean; mode: AssignMode; taskId: string | null }>({
    isOpen: false,
    mode: 'execution',
    taskId: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cờ loading bật/tắt quanh fetch, không phải vòng lặp render
    setIsLoadingTasks(true);
    workTaskApiService
      .getTasks({ orderId })
      .then((res) => setTasks(res.data ?? []))
      .finally(() => setIsLoadingTasks(false));
  }, [orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cờ loading bật/tắt quanh fetch, không phải vòng lặp render
    setIsLoadingAssignments(true);
    assignmentApiService
      .getOrderAssignments(orderId)
      .then((res) => setAssignments(res.data ?? { survey: null, execution: null }))
      .catch(() => setAssignments({ survey: null, execution: null }))
      .finally(() => setIsLoadingAssignments(false));
  }, [orderId]);

  useEffect(() => {
    changeRequestApiService
      .getChangeRequests({ orderId, status: 'pending' })
      .then((res) => setChangeRequests(res.data ?? []))
      .catch(() => setChangeRequests([]));
  }, [orderId]);

  // Báo cáo khảo sát phụ thuộc danh sách task (suy ra task khảo sát).
  const surveyTask = tasks.find((t) => t.taskType === 'survey');
  const surveyTaskId = surveyTask?.workTaskId ?? null;

  useEffect(() => {
    if (isLoadingTasks) return;
    let active = true;
    const load = surveyTaskId
      ? surveyApiService
          .getSurveyReport(surveyTaskId)
          .then((res) => res.data ?? null)
          .catch(() => null)
      : Promise.resolve(null);
    load.then((report) => {
      if (!active) return;
      setSurveyReport(report);
      setIsLoadingReport(false);
    });
    return () => {
      active = false;
    };
  }, [surveyTaskId, isLoadingTasks]);

  const executionTasks = tasks.filter((t) => t.taskType !== 'survey');

  const executionTaskId =
    assignments?.execution?.taskId ??
    tasks.find((t) => t.taskType === 'installation')?.workTaskId ??
    executionTasks[0]?.workTaskId ??
    null;

  const reassignSurveyTaskId = assignments?.survey?.taskId ?? surveyTaskId;

  // Cập nhật lạc quan 1 group sau khi phân công: thay thế member (khảo sát) hoặc nối thêm (thi công).
  const buildGroup = (existing: AssignmentGroup | null, taskId: string, member: AssignmentMember, replace: boolean): AssignmentGroup => {
    if (existing) {
      return { ...existing, members: replace ? [member] : [...existing.members, member] };
    }
    const task = tasks.find((t) => t.workTaskId === taskId);
    return {
      taskId,
      scheduledStart: task?.scheduledStart ?? '',
      scheduledEnd: task?.scheduledEnd ?? '',
      members: [member],
    };
  };

  const handleAssigned = (mode: AssignMode, member: AssignmentMember) => {
    setAssignments((prev) => {
      const base: OrderAssignments = prev ?? { survey: null, execution: null };
      if (mode === 'survey') {
        return { ...base, survey: buildGroup(base.survey, reassignSurveyTaskId ?? '', member, true) };
      }
      return { ...base, execution: buildGroup(base.execution, executionTaskId ?? '', member, false) };
    });
  };

  const handleApproveCr = (id: string) => updateCr(id, 'approved');
  const handleRejectCr = (id: string) => updateCr(id, 'rejected');

  const updateCr = (id: string, status: 'approved' | 'rejected') => {
    setCrSubmittingId(id);
    changeRequestApiService
      .approveChangeRequest(id, status)
      .then(() => setChangeRequests((prev) => prev.filter((cr) => cr.changeRequestId !== id)))
      .finally(() => setCrSubmittingId(null));
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SurveyResultCard
            report={surveyReport}
            surveyorName={assignments?.survey?.members[0]?.fullName}
            isLoading={isLoadingReport}
          />
          <ExecutionTrackingCard tasks={executionTasks} isLoading={isLoadingTasks} />
        </div>

        <div className="space-y-6">
          <SurveyAssignmentCard
            group={assignments?.survey ?? null}
            canManage={canManage}
            isLoading={isLoadingAssignments}
            onReassign={() => setModal({ isOpen: true, mode: 'survey', taskId: reassignSurveyTaskId })}
          />
          <ExecutionPersonnelCard
            group={assignments?.execution ?? null}
            canManage={canManage}
            canAssign={executionTaskId !== null}
            isLoading={isLoadingAssignments}
            onAssign={() => setModal({ isOpen: true, mode: 'execution', taskId: executionTaskId })}
          />
          <FieldChangeRequestCard
            changeRequests={changeRequests}
            canManage={canManage}
            submittingId={crSubmittingId}
            onApprove={handleApproveCr}
            onReject={handleRejectCr}
          />
        </div>
      </div>

      <AssignStaffModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        taskId={modal.taskId}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
        onAssigned={handleAssigned}
      />
    </>
  );
}
