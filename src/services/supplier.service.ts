import api from './api';
import type { CreateSupplierPayload, GetSuppliersQuery, Supplier } from '@/types/supplier';

export const supplierApiService = {
  /** GET /api/v1/suppliers (UC 2.16) */
  async getSuppliers(params?: GetSuppliersQuery) {
    const response = await api.get('/suppliers', { params });
    return response.data as { success: boolean; data: Supplier[]; meta: { totalCount: number } };
  },

  /** POST /api/v1/suppliers (UC 2.16) */
  async createSupplier(payload: CreateSupplierPayload) {
    const response = await api.post('/suppliers', payload);
    return response.data;
  },

  /** PUT /api/v1/suppliers/:id/status (UC 2.16) */
  async updateSupplierStatus(id: string, status: 'active' | 'inactive') {
    const response = await api.put(`/suppliers/${id}/status`, { status });
    return response.data;
  },
};
