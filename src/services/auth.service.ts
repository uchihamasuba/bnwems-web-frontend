import api from './api';

export interface LoginPayload {
  username: string;
  password: string;
  device_type?: 'web' | 'android' | 'ios';
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordPayload {
  username: string;
}

export interface VerifyOtpPayload {
  username: string;
  otp: string;
}

export interface ResetPasswordPayload {
  reset_token: string;
  new_password: string;
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
   * PUT /api/v1/me/password
   */
  async changePassword(payload: ChangePasswordPayload) {
    const response = await api.put('/me/password', payload);
    return response.data;
  },

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await api.post('/auth/forgot-password', payload);
    return response.data;
  },

  /**
   * POST /api/v1/auth/forgot-password/verify
   */
  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await api.post('/auth/forgot-password/verify', payload);
    return response.data;
  },

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(payload: ResetPasswordPayload) {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },
};
