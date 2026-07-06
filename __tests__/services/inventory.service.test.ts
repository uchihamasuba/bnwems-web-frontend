/**
 * @file inventory.service.test.ts
 * Unit tests for the Inventory API Service wrapper sau đợt refactor 2026-07-06 — không còn khái
 * niệm nhiều kho (warehouseId), Inventory khoá 1-1 theo itemId (types/inventory.ts).
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
import { inventoryApiService } from '../../src/services/inventory.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('inventoryApiService — getInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /inventory with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.getInventory({ itemId: 'item-6', page: 1, limit: 20 });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory', {
      params: { itemId: 'item-6', page: 1, limit: 20 },
    });
  });
});

describe('inventoryApiService — adjustInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/adjust with body (quantityChange có thể âm)', async () => {
    const mockResponse = { data: { success: true } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { itemId: 'item-6', quantityChange: -5, notes: 'Hỏng 5 cái' };
    await inventoryApiService.adjustInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/adjust', body);
  });
});

describe('inventoryApiService — getMovements()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /inventory/movements with query params', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.getMovements({ itemId: 'item-6', movementType: 'ADJUSTMENT' });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory/movements', {
      params: { itemId: 'item-6', movementType: 'ADJUSTMENT' },
    });
  });
});

describe('inventoryApiService — createReturnReport() / confirmReturnReport()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/return-reports with body', async () => {
    const mockResponse = { data: { success: true, data: { reportId: 'rpt-1' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = {
      orderId: 'order-1',
      reportType: 'INTERNAL' as const,
      items: [{ itemId: 'item-6', goodQuantity: 8, damagedQuantity: 1, lostQuantity: 1 }],
    };
    await inventoryApiService.createReturnReport(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/return-reports', body);
  });

  it('should call PUT /inventory/return-reports/{id}/confirm', async () => {
    const mockResponse = { data: { success: true } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.confirmReturnReport('rpt-1');

    expect(mockApi.put).toHaveBeenCalledWith('/inventory/return-reports/rpt-1/confirm');
  });
});
