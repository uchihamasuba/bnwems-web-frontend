/**
 * @file catalog.service.test.ts
 * Unit tests for the Catalog API Service wrapper sau đợt refactor 2026-07-06 — kiến trúc 3 tầng
 * Category → Type → Item (types/catalog.ts).
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

describe('catalogApiService — getItems()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /catalog/items with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getItems({ page: 1, limit: 20, search: 'loa', typeId: '3', status: 'ACTIVE' });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/items', {
      params: { page: 1, limit: 20, search: 'loa', typeId: '3', status: 'ACTIVE' },
    });
  });
});

describe('catalogApiService — createItem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /catalog/items with payload', async () => {
    const payload = { itemCode: 'ITM-01', itemName: 'Loa Bose L1', typeId: '3', unit: 'Cái', rentalPrice: 500000 };
    const mockResponse = { data: { success: true, message: 'Tạo thiết bị thành công.', data: { itemId: 'item-10' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await catalogApiService.createItem(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/catalog/items', payload);
    expect(result.data.itemId).toBe('item-10');
  });
});

describe('catalogApiService — updateItem()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog/items/{id} with payload', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật thiết bị thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateItem('item-10', { itemName: 'Loa Bose L1 Pro', rentalPrice: 550000 });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog/items/item-10', { itemName: 'Loa Bose L1 Pro', rentalPrice: 550000 });
  });
});

describe('catalogApiService — updateItemStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PATCH /catalog/items/{id}/status', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật trạng thái thành công.' } };
    (mockApi.patch as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateItemStatus('item-10', { status: 'INACTIVE' });

    expect(mockApi.patch).toHaveBeenCalledWith('/catalog/items/item-10/status', { status: 'INACTIVE' });
  });
});

describe('catalogApiService — getCategories()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /catalog/categories with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getCategories({ page: 1, limit: 20, search: 'stage' });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/categories', {
      params: { page: 1, limit: 20, search: 'stage' },
    });
  });
});

describe('catalogApiService — createCategory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /catalog/categories with payload', async () => {
    const payload = { categoryName: 'LED Screen', description: 'Visual display panels' };
    const mockResponse = { data: { success: true, data: { categoryId: 'cat-5' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await catalogApiService.createCategory(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/catalog/categories', payload);
    expect(result.data.categoryId).toBe('cat-5');
  });
});

describe('catalogApiService — updateCategory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /catalog/categories/{id} with payload', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật danh mục thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCategory('cat-1', { categoryName: 'Wedding Stage v2' });

    expect(mockApi.put).toHaveBeenCalledWith('/catalog/categories/cat-1', { categoryName: 'Wedding Stage v2' });
  });
});

describe('catalogApiService — updateCategoryStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PATCH /catalog/categories/{id}/status (backend hiện là no-op stub)', async () => {
    const mockResponse = { data: { success: true } };
    (mockApi.patch as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.updateCategoryStatus('cat-1', { isActive: false });

    expect(mockApi.patch).toHaveBeenCalledWith('/catalog/categories/cat-1/status', { isActive: false });
  });
});

describe('catalogApiService — getTypes() / getTypeSpecs()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /catalog/types with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getTypes({ categoryId: 'cat-1' });

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/types', { params: { categoryId: 'cat-1' } });
  });

  it('should call GET /catalog/types/{id}/specs', async () => {
    const mockResponse = { data: { success: true, data: [] } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await catalogApiService.getTypeSpecs('type-1');

    expect(mockApi.get).toHaveBeenCalledWith('/catalog/types/type-1/specs');
  });
});
