import api from './api';
import type {
  CheckoutInventoryRequest,
  CreateInventoryRequest,
  GetInventoryAvailabilityQuery,
  GetInventoryQuery,
  GetInventoryReportsQuery,
  ReserveInventoryRequest,
  ReturnInventoryRequest,
  UpdateInventoryRequest,
} from '@/types/inventory';

export const inventoryApiService = {
  /** GET /api/v1/inventory (UC 2.13) */
  async getInventory(params?: GetInventoryQuery) {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  /** POST /api/v1/inventory (UC 2.13) */
  async createInventory(body: CreateInventoryRequest) {
    const response = await api.post('/inventory', body);
    return response.data;
  },

  /** PUT /api/v1/inventory/:id (UC 2.13) */
  async updateInventory(id: string, body: UpdateInventoryRequest) {
    const response = await api.put(`/inventory/${id}`, body);
    return response.data;
  },

  /** GET /api/v1/inventory/availability (UC 2.13) */
  async getInventoryAvailability(params: GetInventoryAvailabilityQuery) {
    const response = await api.get('/inventory/availability', { params });
    return response.data;
  },

  /** POST /api/v1/inventory/reserve (UC 2.13) */
  async reserveInventory(body: ReserveInventoryRequest) {
    const response = await api.post('/inventory/reserve', body);
    return response.data;
  },

  /** GET /api/v1/inventory/inventory-reports (UC 2.23) */
  async getInventoryReports(params?: GetInventoryReportsQuery) {
    const response = await api.get('/inventory/inventory-reports', { params });
    return response.data;
  },

  /** POST /api/v1/inventory/checkout (UC 2.23) */
  async checkoutInventory(body: CheckoutInventoryRequest) {
    const response = await api.post('/inventory/checkout', body);
    return response.data;
  },

  /** POST /api/v1/inventory/return (UC 2.23) */
  async returnInventory(body: ReturnInventoryRequest) {
    const response = await api.post('/inventory/return', body);
    return response.data;
  },
};
