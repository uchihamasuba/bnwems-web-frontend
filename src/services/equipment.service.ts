import api from './api';
import type { CreateEquipmentPayload, UpdateEquipmentPayload, UpdateEquipmentStatusPayload } from '@/types/equipment';

export interface GetEquipmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const equipmentApiService = {
  /** GET /api/v1/equipment (UC 2.5) */
  async getEquipment(params?: GetEquipmentQuery) {
    const response = await api.get('/equipment', { params });
    return response.data;
  },

  /** GET /api/v1/equipment/{id} (UC 2.5) */
  async getEquipmentItem(id: string) {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  /** POST /api/v1/equipment (UC 2.5) */
  async createEquipment(payload: CreateEquipmentPayload) {
    const response = await api.post('/equipment', payload);
    return response.data;
  },

  /** PUT /api/v1/equipment/{id} (UC 2.5) */
  async updateEquipment(id: string, payload: UpdateEquipmentPayload) {
    const response = await api.put(`/equipment/${id}`, payload);
    return response.data;
  },

  /** PATCH /api/v1/equipment/{id}/status (UC 2.4) */
  async updateEquipmentStatus(id: string, payload: UpdateEquipmentStatusPayload) {
    const response = await api.patch(`/equipment/${id}/status`, payload);
    return response.data;
  },
};
