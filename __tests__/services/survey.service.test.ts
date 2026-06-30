/**
 * @file survey.service.test.ts
 * Unit tests for the Survey API Service wrapper (docs/api/10-survey-assignment.md, UC 2.12).
 */

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return { default: mockAxios, ...mockAxios };
});

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from '../../src/services/api';
import { surveyApiService } from '../../src/services/survey.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('surveyApiService — getSurveyReport()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /tasks/{taskId}/survey-report and return the envelope', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { workTaskId: 'task-s2', notes: 'note', evidences: [], submittedAt: '2026-07-05T07:30:00Z' },
      },
    };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await surveyApiService.getSurveyReport('task-s2');

    expect(mockApi.get).toHaveBeenCalledWith('/tasks/task-s2/survey-report');
    expect(result.data?.workTaskId).toBe('task-s2');
  });
});
