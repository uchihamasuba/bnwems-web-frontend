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

  /** GET /api/v1/reports/revenue (UC 2.7) */
  async getRevenueReport(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  /** GET /api/v1/reports/inventory (UC 2.7) */
  async getInventoryReport(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },

  /** GET /api/v1/manager/approvals (UC 2.8) */
  async getManagerApprovals() {
    const response = await api.get('/manager/approvals');
    return response.data;
  },

  /** PUT /api/v1/warnings/{id}/resolve */
  async resolveWarning(id: string) {
    const response = await api.put(`/warnings/${id}/resolve`);
    return response.data;
  },
};
