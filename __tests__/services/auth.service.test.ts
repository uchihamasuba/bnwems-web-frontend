/**
 * @file auth.service.test.ts
 * Unit tests for the Auth API Service wrapper.
 */

// Mock axios entirely
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
        statusCode: 200,
        data: { token: 'mock.token', user: { id: 1, username: 'manager_test' } },
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

  it('should call PUT /me/password with correct payload', async () => {
    const mockResponse = { data: { success: true, statusCode: 200, message: 'Thay đổi mật khẩu thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.changePassword({
      current_password: 'P@ssword2026',
      new_password: 'NewP@ss2026!',
    });

    expect(mockApi.put).toHaveBeenCalledWith('/me/password', {
      current_password: 'P@ssword2026',
      new_password: 'NewP@ss2026!',
    });
    expect(result.success).toBe(true);
  });
});

describe('authApiService — forgot password flow', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /auth/forgot-password with username', async () => {
    const mockResponse = { data: { success: true, message: 'Nếu tài khoản tồn tại, mã xác nhận đã được gửi' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await authApiService.forgotPassword({ username: 'manager01' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { username: 'manager01' });
  });

  it('should call POST /auth/forgot-password/verify with username and otp', async () => {
    const mockResponse = { data: { success: true, data: { reset_token: 'rst_8f2c1a', expires_in: 300 } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.verifyOtp({ username: 'manager01', otp: '839204' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password/verify', {
      username: 'manager01',
      otp: '839204',
    });
    expect(result.data.reset_token).toBe('rst_8f2c1a');
  });

  it('should call POST /auth/reset-password with reset_token and new_password', async () => {
    const mockResponse = { data: { success: true, message: 'Đặt lại mật khẩu thành công' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApiService.resetPassword({ reset_token: 'rst_8f2c1a', new_password: 'NewP@ss2026!' });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
      reset_token: 'rst_8f2c1a',
      new_password: 'NewP@ss2026!',
    });
    expect(result.success).toBe(true);
  });
});
