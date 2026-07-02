import api from './api';
import type {
  CreateCatalogCategoryPayload,
  UpdateCatalogCategoryPayload,
  UpdateCatalogCategoryStatusPayload,
} from '@/types/catalog';

export interface GetCatalogCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const catalogApiService = {
  /** GET /api/v1/catalog-categories (UC 2.5) */
  async getCatalogCategories(params?: GetCatalogCategoriesQuery) {
    const response = await api.get('/catalog-categories', { params });
    return response.data;
  },

  /** GET /api/v1/catalog-categories/{id} (UC 2.5) */
  async getCatalogCategory(id: string) {
    const response = await api.get(`/catalog-categories/${id}`);
    return response.data;
  },

  /** POST /api/v1/catalog-categories (UC 2.5) */
  async createCatalogCategory(payload: CreateCatalogCategoryPayload) {
    const response = await api.post('/catalog-categories', payload);
    return response.data;
  },

  /** PUT /api/v1/catalog-categories/{id} (UC 2.5) */
  async updateCatalogCategory(id: string, payload: UpdateCatalogCategoryPayload) {
    const response = await api.put(`/catalog-categories/${id}`, payload);
    return response.data;
  },

  /** PUT /api/v1/catalog-categories/{id}/deactivate (UC 2.5) */
  async updateCatalogCategoryStatus(id: string, payload: UpdateCatalogCategoryStatusPayload) {
    const response = await api.put(`/catalog-categories/${id}/deactivate`, payload);
    return response.data;
  },
};
