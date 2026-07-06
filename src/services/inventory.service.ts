import api from './api';
import type {
  AdjustInventoryRequest,
  GetInventoryQuery,
  GetInventoryMovementsQuery,
} from '@/types/inventory';

export const inventoryApiService = {
  /** GET /api/v1/inventory (UC 2.13) */
  async getInventory(params?: GetInventoryQuery) {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  /** POST /api/v1/inventory/adjust (UC 2.13) */
  async adjustInventory(body: AdjustInventoryRequest) {
    const response = await api.post('/inventory/adjust', body);
    return response.data;
  },

  /** GET /api/v1/inventory/movements (UC 2.23) */
  async getInventoryMovements(params?: GetInventoryMovementsQuery) {
    const response = await api.get('/inventory/movements', { params });
    return response.data;
  },
};
