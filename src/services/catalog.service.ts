import api from './api';
import type {
  CreateCatalogCategoryPayload,
  CreateCatalogItemPayload,
  UpdateCatalogCategoryPayload,
  UpdateCatalogCategoryStatusPayload,
  UpdateCatalogItemPayload,
  UpdateCatalogItemStatusPayload,
} from '@/types/catalog';

export interface GetCatalogItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  itemType?: string;
  isActive?: boolean;
}

export interface GetCatalogCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export const catalogApiService = {
  /** GET /api/v1/catalog/items (UC 2.5) */
  async getCatalogItems(params?: GetCatalogItemsQuery) {
    const response = await api.get('/catalog/items', { params });
    return response.data;
  },

  /** GET /api/v1/catalog/items/{id} (UC 2.5) */
  async getCatalogItem(id: string) {
    const response = await api.get(`/catalog/items/${id}`);
    return response.data;
  },

  /** POST /api/v1/catalog/items (UC 2.5) */
  async createCatalogItem(payload: CreateCatalogItemPayload) {
    const response = await api.post('/catalog/items', payload);
    return response.data;
  },

  /** PUT /api/v1/catalog/items/{id} (UC 2.5) */
  async updateCatalogItem(id: string, payload: UpdateCatalogItemPayload) {
    const response = await api.put(`/catalog/items/${id}`, payload);
    return response.data;
  },

  /** PATCH /api/v1/catalog/items/{id}/status (UC 2.5) */
  async updateCatalogItemStatus(id: string, payload: UpdateCatalogItemStatusPayload) {
    const response = await api.patch(`/catalog/items/${id}/status`, payload);
    return response.data;
  },

  /** GET /api/v1/catalog/categories (UC 2.5) */
  async getCatalogCategories(params?: GetCatalogCategoriesQuery) {
    const response = await api.get('/catalog/categories', { params });
    return response.data;
  },

  /** GET /api/v1/catalog/categories/{id} (UC 2.5) */
  async getCatalogCategory(id: string) {
    const response = await api.get(`/catalog/categories/${id}`);
    return response.data;
  },

  /** POST /api/v1/catalog/categories (UC 2.5) */
  async createCatalogCategory(payload: CreateCatalogCategoryPayload) {
    const response = await api.post('/catalog/categories', payload);
    return response.data;
  },

  /** PUT /api/v1/catalog/categories/{id} (UC 2.5) */
  async updateCatalogCategory(id: string, payload: UpdateCatalogCategoryPayload) {
    const response = await api.put(`/catalog/categories/${id}`, payload);
    return response.data;
  },

  /** PATCH /api/v1/catalog/categories/{id}/status (UC 2.5) */
  async updateCatalogCategoryStatus(id: string, payload: UpdateCatalogCategoryStatusPayload) {
    const response = await api.patch(`/catalog/categories/${id}/status`, payload);
    return response.data;
  },
};
