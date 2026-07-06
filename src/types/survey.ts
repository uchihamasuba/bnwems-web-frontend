// UC 2.12 (docs/api/10-survey-assignment.md)

// GET /api/v1/tasks/:id/survey-report
// Lưu ý: backend thật KHÔNG trả `surveyedBy` (danh tính khảo sát viên) — field này được bù từ
// mock phân công để hiển thị tên KSV trên UI. Xem docs/more-require.md mục (o).
export interface SurveyEvidence {
  fileUrl: string;
}

export interface SurveyReportAuthor {
  userId: string;
  fullName: string;
}

export interface SurveyReport {
  workTaskId: string;
  notes: string;
  evidences: SurveyEvidence[];
  submittedAt: string;
  surveyedBy?: SurveyReportAuthor; // backend trả { userId, fullName } (task.service.ts viewSurveyReport)
}
