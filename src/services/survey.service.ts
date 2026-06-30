import api from './api';
import type { SurveyReport } from '@/types/survey';

export const surveyApiService = {
  /** GET /api/v1/tasks/:id/survey-report (UC 2.12) */
  async getSurveyReport(taskId: string) {
    const response = await api.get(`/tasks/${taskId}/survey-report`);
    return response.data as { success: boolean; data: SurveyReport | null };
  },
};
