/**
 * @file assignment.service.test.ts
 * Unit tests for the Assignment API Service wrapper (docs/api/10-survey-assignment.md, UC 2.15).
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
import { assignmentApiService } from '../../src/services/assignment.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('assignmentApiService — getOrderAssignments()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should call same-origin mock route, bypassing the `api` axios instance', async () => {
    const mockJson = { success: true, data: { survey: null, execution: null } };
    (global.fetch as jest.Mock).mockResolvedValue({ json: () => Promise.resolve(mockJson) });

    const result = await assignmentApiService.getOrderAssignments('order-2');

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/orders/order-2/assignments');
    expect(mockApi.get).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});

describe('assignmentApiService — assignStaff()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /tasks/{taskId}/assignments with the assignments payload', async () => {
    const mockResponse = { data: { success: true, message: 'Staff assigned and notified.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const payload = { assignments: [{ userId: 'usr-3', assignedRole: 'Trưởng nhóm' }] };
    await assignmentApiService.assignStaff('task-i2', payload);

    expect(mockApi.post).toHaveBeenCalledWith('/tasks/task-i2/assignments', payload);
  });
});
