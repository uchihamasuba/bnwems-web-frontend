/**
 * @file inventory.service.test.ts
 * Unit tests for the Inventory API Service wrapper (docs/api/05-warehouse-inventory.md).
 * The `Warehouse` entity was removed from the backend contract — inventory is now tracked
 * purely by `equipmentItemId`, and check-out/return/report endpoints moved under `/inventory`.
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

  it('should call GET /inventory with query params (UC 2.13)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.getInventory({ equipmentItemId: 'eq-6', page: 1, limit: 20 });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory', {
      params: { equipmentItemId: 'eq-6', page: 1, limit: 20 },
    });
  });
});

describe('inventoryApiService — createInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory with body (UC 2.13)', async () => {
    const mockResponse = { data: { success: true, message: 'Inventory created successfully.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { equipmentItemId: 'eq-6', availableQuantity: 50 };
    await inventoryApiService.createInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory', body);
  });
});

describe('inventoryApiService — updateInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /inventory/:id with body (UC 2.13)', async () => {
    const mockResponse = { data: { success: true, message: 'Inventory updated successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    const body = { availableQuantity: 40, reservedQuantity: 10, damagedQuantity: 1 };
    await inventoryApiService.updateInventory('inv-1', body);

    expect(mockApi.put).toHaveBeenCalledWith('/inventory/inv-1', body);
  });
});

describe('inventoryApiService — getInventoryAvailability()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /inventory/availability with query params (UC 2.13)', async () => {
    const mockResponse = {
      data: { success: true, data: { equipmentItemId: 'eq-6', isAvailable: true, availableQuantityOnDate: 80 } },
    };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await inventoryApiService.getInventoryAvailability({ eventDate: '2026-10-15', equipmentItemId: 'eq-6' });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory/availability', {
      params: { eventDate: '2026-10-15', equipmentItemId: 'eq-6' },
    });
    expect(result.data.isAvailable).toBe(true);
  });
});

describe('inventoryApiService — reserveInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/reserve with body (UC 2.13)', async () => {
    const mockResponse = { data: { success: true, message: 'Inventory successfully reserved.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { orderId: 'order-1', items: [{ equipmentItemId: 'eq-6', quantity: 5 }] };
    await inventoryApiService.reserveInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/reserve', body);
  });
});

describe('inventoryApiService — getInventoryReports()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /inventory/inventory-reports with query params (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.getInventoryReports({ reportType: 'checkout', page: 1, limit: 20 });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory/inventory-reports', {
      params: { reportType: 'checkout', page: 1, limit: 20 },
    });
  });
});

describe('inventoryApiService — checkoutInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/checkout with body (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, message: 'Items checked out successfully.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { orderId: 'order-1', items: [{ equipmentItemId: 'eq-6', quantity: 10 }] };
    await inventoryApiService.checkoutInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/checkout', body);
  });
});

describe('inventoryApiService — returnInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/return with body (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, message: 'Items returned to inventory.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = {
      orderId: 'order-1',
      items: [{ equipmentItemId: 'eq-6', quantity: 10, condition: 'good' as const }],
    };
    await inventoryApiService.returnInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/return', body);
  });
});
