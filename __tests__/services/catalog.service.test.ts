/**
 * @file catalog.service.test.ts
 * Unit tests for the Catalog Item API Service wrapper (docs/api/03-catalog.md).
 */

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return { default: mockAxios, ...mockAxios };
});

jest.mock('../../src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from '../../src/services/api';
import { catalogApiService } from '../../src/services/catalog.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('catalogApiService — getCatalogItems()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /catalog-items with query params (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getCatalogItems({ page: 1, limit: 20, search: 'loa', itemType: 'EQUIPMENT', isActive: true });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog-items', {
      params: { page: 1, limit: 20, search: 'loa', itemType: 'EQUIPMENT', isActive: true },
    });
  });
});

describe('catalogApiService — createCatalogItem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /catalog-items with payload (UC 2.5)', async () => {
    const payload = { name: 'Loa Bose L1', description: 'Loa array công suất lớn', itemType: 'EQUIPMENT' as const, basePrice: 500000 };
    const mockResponse = { data: { success: true, message: 'Catalog item created successfully.', data: { id: 'item-10' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await catalogApiService.createCatalogItem(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/catalog-items', payload);
    expect(result.data.id).toBe('item-10');
  });
});

describe('catalogApiService — updateCatalogItem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog-items/{id} with payload (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, message: 'Catalog item updated successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCatalogItem('item-10', {
      name: 'Loa Bose L1 Pro',
      description: 'Bản nâng cấp',
      basePrice: 550000,
    });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog-items/item-10', {
      name: 'Loa Bose L1 Pro',
      description: 'Bản nâng cấp',
      basePrice: 550000,
    });
  });
});

describe('catalogApiService — updateCatalogItemStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog-items/{id}/deactivate with isActive (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, message: 'Catalog item status changed successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCatalogItemStatus('item-10', { isActive: false });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog-items/item-10/deactivate', { isActive: false });
  });
});

describe('catalogApiService — getCatalogCategories()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /catalog-categories with query params (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getCatalogCategories({ page: 1, limit: 20, search: 'stage', isActive: true });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog-categories', {
      params: { page: 1, limit: 20, search: 'stage', isActive: true },
    });
  });
});

describe('catalogApiService — createCatalogCategory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /catalog-categories with payload (UC 2.5)', async () => {
    const payload = { name: 'LED Screen', description: 'Visual display panels', displayOrder: 3 };
    const mockResponse = { data: { success: true, message: 'Catalog category created successfully.', data: { id: 'cat-5' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await catalogApiService.createCatalogCategory(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/catalog-categories', payload);
    expect(result.data.id).toBe('cat-5');
  });
});

describe('catalogApiService — updateCatalogCategory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog-categories/{id} with payload (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, message: 'Catalog category updated successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCatalogCategory('cat-1', { name: 'Wedding Stage v2', displayOrder: 1 });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog-categories/cat-1', { name: 'Wedding Stage v2', displayOrder: 1 });
  });
});

describe('catalogApiService — updateCatalogCategoryStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog-categories/{id}/deactivate with isActive (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, message: 'Catalog category status changed successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCatalogCategoryStatus('cat-1', { isActive: false });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog-categories/cat-1/deactivate', { isActive: false });
  });
});
