import api from './api';

export interface LoginPayload {
  username: string;
  password: string;
  device_type?: 'web' | 'android' | 'ios';
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const authApiService = {
  /**
   * POST /api/v1/auth/login
   */
  async login(payload: LoginPayload) {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  /**
   * PUT /api/v1/auth/change-password
   */
  async changePassword(payload: ChangePasswordPayload) {
    const response = await api.put('/auth/change-password', payload);
    return response.data;
  },
};
