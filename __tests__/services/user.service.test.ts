/**
 * @file user.service.test.ts
 * Unit tests for the User Management API Service wrapper sau đợt refactor 2026-07-06 — role raw
 * enum không hậu tố _STAFF (types/user.ts).
 */

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
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
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from '../../src/services/api';
import { userApiService } from '../../src/services/user.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('userApiService — getUsers()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /users with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await userApiService.getUsers({ page: 1, limit: 20, search: 'a', role: 'MANAGER', status: 'ACTIVE' });

    expect(mockApi.get).toHaveBeenCalledWith('/users', {
      params: { page: 1, limit: 20, search: 'a', role: 'MANAGER', status: 'ACTIVE' },
    });
  });
});

describe('userApiService — createUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /users with payload', async () => {
    const payload = {
      fullName: 'Lê Văn C',
      username: 'leader02',
      password: 'initPass123',
      role: 'LEADER' as const,
    };
    const mockResponse = { data: { success: true, message: 'Tạo người dùng thành công.', data: { userId: 'usr-20' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await userApiService.createUser(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/users', payload);
    expect(result.data.userId).toBe('usr-20');
  });
});

describe('userApiService — updateUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /users/{id} with payload', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật người dùng thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await userApiService.updateUser('usr-20', { fullName: 'Lê Văn C', role: 'MANAGER' });

    expect(mockApi.put).toHaveBeenCalledWith('/users/usr-20', { fullName: 'Lê Văn C', role: 'MANAGER' });
  });
});

describe('userApiService — updateUserStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PATCH /users/{id}/status with status', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật trạng thái người dùng thành công.' } };
    (mockApi.patch as jest.Mock).mockResolvedValue(mockResponse);

    await userApiService.updateUserStatus('usr-20', { status: 'INACTIVE' });

    expect(mockApi.patch).toHaveBeenCalledWith('/users/usr-20/status', { status: 'INACTIVE' });
  });
});

describe('userApiService — resetPassword()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /users/{id}/reset-password with newPassword', async () => {
    const mockResponse = { data: { success: true, message: 'Đặt lại mật khẩu người dùng thành công.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await userApiService.resetPassword('usr-20', { newPassword: 'resetPass456' });

    expect(mockApi.post).toHaveBeenCalledWith('/users/usr-20/reset-password', { newPassword: 'resetPass456' });
  });
});
