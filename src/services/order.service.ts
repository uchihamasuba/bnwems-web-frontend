import api from './api';

export interface GetOrdersQuery {
  status?: string;
  page?: number;
}

export interface CreateOrderPayload {
  customerId: number;
  eventDate: string;
  eventLocation: string;
  notes?: string;
}

export const orderApiService = {
  async getOrders(query?: GetOrdersQuery) {
    const response = await api.get('/orders', { params: query });
    return response.data;
  },

  async getOrderById(id: number) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async createOrder(payload: CreateOrderPayload) {
    const response = await api.post('/orders', payload);
    return response.data;
  },
};

export const equipmentApiService = {
  async getEquipments(query?: { categoryId?: number; search?: string }) {
    const response = await api.get('/equipment', { params: query });
    return response.data;
  },
};
