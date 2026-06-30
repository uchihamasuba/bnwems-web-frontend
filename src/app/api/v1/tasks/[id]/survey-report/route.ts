import { mockFailure, mockSuccess } from '@/lib/mock-response';
import { mockSurveyReports } from '@/mocks/seed';

// UC 2.12 — GET /api/v1/tasks/:id/survey-report (docs/api/10-survey-assignment.md)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = mockSurveyReports.find((r) => r.workTaskId === id);
  if (!report) {
    return mockFailure('Survey report not found', { status: 404 });
  }
  return mockSuccess(report);
}
