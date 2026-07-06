/**
 * @file survey.service.test.ts
 * Unit tests for the Survey API Service wrapper sau đợt refactor 2026-07-06 (types/survey.ts).
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

describe('surveyApiService — getOrderSurveyReports()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /orders/{orderId}/survey-reports and return the envelope', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: [{ surveyId: 'srv-1', orderId: 'order-2', reportCode: 'SRV-001', location: 'Sảnh A', status: 'SUBMITTED' }],
      },
    };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await surveyApiService.getOrderSurveyReports('order-2');

    expect(mockApi.get).toHaveBeenCalledWith('/orders/order-2/survey-reports');
    expect(result.data?.[0]?.surveyId).toBe('srv-1');
  });
});

describe('surveyApiService — createSurveyReport() / confirmSurveyReport()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /survey-reports with payload', async () => {
    const mockResponse = { data: { success: true, message: 'Đã nộp báo cáo khảo sát thành công.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const payload = { orderId: 'order-2', surveyDate: '2026-07-10T08:00:00Z', location: 'Sảnh A' };
    await surveyApiService.createSurveyReport(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/survey-reports', payload);
  });

  it('should call PUT /survey-reports/{id}/confirm with status', async () => {
    const mockResponse = { data: { success: true } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await surveyApiService.confirmSurveyReport('srv-1', { status: 'CONFIRMED' });

    expect(mockApi.put).toHaveBeenCalledWith('/survey-reports/srv-1/confirm', { status: 'CONFIRMED' });
  });
});
