import api from './api';

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
}

export const userApiService = {
  async getUsers(query?: GetUsersQuery) {
    const response = await api.get('/admin/users', { params: query });
    return response.data;
  },

  async createUser(payload: CreateUserPayload) {
    const response = await api.post('/admin/users', payload);
    return response.data;
  },

  async deactivateUser(id: number) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
