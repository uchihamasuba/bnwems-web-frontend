/**
 * @file auth.service.test.ts
 * Unit tests for the Auth API Service wrapper (docs/api/01-auth.md).
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
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from '../../src/services/api';
import { authApiService } from '../../src/services/auth.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('authApiService — login()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /auth/login with correct payload', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: { token: 'mock.token', expiresIn: 86400, user: { userId: 'usr-1', username: 'manager_test' } },
      },
    };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.login({ username: 'manager_test', password: 'P@ssword2026' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
      username: 'manager_test',
      password: 'P@ssword2026',
    });
    expect(result.data.token).toBe('mock.token');
  });

  it('should propagate API errors on login failure', async () => {
    (mockApi.post as jest.Mock).mockRejectedValue(new Error('Network Error'));
    await expect(authApiService.login({ username: 'bad', password: 'wrong' })).rejects.toThrow('Network Error');
  });
});

describe('authApiService — changePassword()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /auth/change-password with correct payload', async () => {
    const mockResponse = { data: { success: true, message: 'Password changed successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.changePassword({
      oldPassword: 'P@ssword2026',
      newPassword: 'NewP@ss2026!',
      confirmNewPassword: 'NewP@ss2026!',
    });

    expect(mockApi.put).toHaveBeenCalledWith('/auth/change-password', {
      oldPassword: 'P@ssword2026',
      newPassword: 'NewP@ss2026!',
      confirmNewPassword: 'NewP@ss2026!',
    });
    expect(result.success).toBe(true);
  });
});

describe('authApiService — forgotPassword()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /auth/forgot-password with username', async () => {
    const mockResponse = { data: { success: true, message: 'If the account exists, a recovery email has been sent.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await authApiService.forgotPassword({ username: 'manager01' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { username: 'manager01' });
  });
});

describe('authApiService — getProfile()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /auth/profile', async () => {
    const mockResponse = {
      data: { success: true, data: { userId: 'usr-1', username: 'manager01', fullName: 'Manager One', role: { roleId: '2', roleName: 'Manager' }, status: 'active' } },
    };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.getProfile();

    expect(mockApi.get).toHaveBeenCalledWith('/auth/profile');
    expect(result.data.username).toBe('manager01');
  });
});
