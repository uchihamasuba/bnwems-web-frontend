import api from './api';

export interface GetEquipmentQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const equipmentApiService = {
  /** GET /api/v1/equipment — xem ghi chú nguồn trong src/types/equipment.ts */
  async getEquipments(params?: GetEquipmentQuery) {
    const response = await api.get('/equipment', { params });
    return response.data;
  },

  /** GET /api/v1/equipment/{id} */
  async getEquipment(id: string) {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },
};
