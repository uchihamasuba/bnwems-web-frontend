import api from './api';

export const reportApiService = {
  /** GET /api/v1/dashboard/admin (UC 2.8) */
  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  /** GET /api/v1/dashboard/manager (UC 2.8) */
  async getManagerDashboard() {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },

  /** GET /api/v1/reports/revenue (UC 2.7). BR-07-01: startDate/endDate are required. */
  async getRevenueReport(params: { startDate: string; endDate: string }) {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  /** GET /api/v1/reports/inventory (UC 2.7) */
  async getInventoryReport(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },
};
