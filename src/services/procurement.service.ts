import api from './api';
import type {
  CreateSupplierTransactionPayload,
  GetSupplierTransactionsQuery,
  SupplierTransaction,
} from '@/types/procurement';

export const procurementApiService = {
  /** GET /api/v1/supplier-transactions (UC 2.16) */
  async getTransactions(params?: GetSupplierTransactionsQuery) {
    const response = await api.get('/supplier-transactions', { params });
    return response.data as { success: boolean; data: SupplierTransaction[]; meta: { totalCount: number } };
  },

  /** POST /api/v1/supplier-transactions (UC 2.16) */
  async createTransaction(payload: CreateSupplierTransactionPayload) {
    const response = await api.post('/supplier-transactions', payload);
    return response.data;
  },
};
