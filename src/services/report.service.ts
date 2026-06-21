import api from './api';

export const reportApiService = {
  /**
   * GET /api/v1/dashboard/admin
   */
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },
};
