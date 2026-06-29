/**
 * @file inventory.service.test.ts
 * Unit tests for the Warehouse/Inventory API Service wrapper (docs/api/05-warehouse-inventory.md).
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

    await inventoryApiService.getInventory({ warehouseId: 'wh-1', catalogItemId: 'item-6', page: 1, limit: 20 });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory', {
      params: { warehouseId: 'wh-1', catalogItemId: 'item-6', page: 1, limit: 20 },
    });
  });
});

describe('inventoryApiService — createInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory with body (outside doc, see types/inventory.ts)', async () => {
    const mockResponse = { data: { success: true, message: 'Tạo bản ghi tồn kho thành công.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { warehouseId: 'wh-1', catalogItemId: 'item-6', availableQuantity: 50 };
    await inventoryApiService.createInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory', body);
  });
});

describe('inventoryApiService — updateInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /inventory/:id with body (outside doc, see types/inventory.ts)', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật tồn kho thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    const body = {
      availableQuantity: 40,
      reservedQuantity: 10,
      checkedOutQuantity: 5,
      damagedQuantity: 1,
      lostQuantity: 0,
    };
    await inventoryApiService.updateInventory('inv-1', body);

    expect(mockApi.put).toHaveBeenCalledWith('/inventory/inv-1', body);
  });
});

describe('inventoryApiService — getInventoryAvailability()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /inventory/availability with query params (UC 2.13)', async () => {
    const mockResponse = {
      data: { success: true, data: { catalogItemId: 'item-6', isAvailable: true, availableQuantityOnDate: 80 } },
    };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await inventoryApiService.getInventoryAvailability({ eventDate: '2026-10-15', itemId: 'item-6' });

    expect(mockApi.get).toHaveBeenCalledWith('/inventory/availability', {
      params: { eventDate: '2026-10-15', itemId: 'item-6' },
    });
    expect(result.data.isAvailable).toBe(true);
  });
});

describe('inventoryApiService — reserveInventory()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /inventory/reserve with body (UC 2.13)', async () => {
    const mockResponse = { data: { success: true, message: 'Inventory successfully reserved.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { orderId: 'order-1', items: [{ catalogItemId: 'item-6', quantity: 5 }] };
    await inventoryApiService.reserveInventory(body);

    expect(mockApi.post).toHaveBeenCalledWith('/inventory/reserve', body);
  });
});

describe('inventoryApiService — getWarehouseHistories()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /warehouse-histories with query params (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await inventoryApiService.getWarehouseHistories({ transactionType: 'CHECKOUT', page: 1, limit: 20 });

    expect(mockApi.get).toHaveBeenCalledWith('/warehouse-histories', {
      params: { transactionType: 'CHECKOUT', page: 1, limit: 20 },
    });
  });
});

describe('inventoryApiService — checkoutWarehouse()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /warehouse/checkout with body (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, message: 'Items checked out successfully.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = { warehouseId: 'wh-1', orderId: 'order-1', items: [{ catalogItemId: 'item-6', quantity: 10 }] };
    await inventoryApiService.checkoutWarehouse(body);

    expect(mockApi.post).toHaveBeenCalledWith('/warehouse/checkout', body);
  });
});

describe('inventoryApiService — returnWarehouse()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /warehouse/return with body (UC 2.23)', async () => {
    const mockResponse = { data: { success: true, message: 'Items returned to warehouse.' } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const body = {
      warehouseId: 'wh-1',
      orderId: 'order-1',
      items: [{ catalogItemId: 'item-6', quantity: 10, condition: 'GOOD' as const }],
    };
    await inventoryApiService.returnWarehouse(body);

    expect(mockApi.post).toHaveBeenCalledWith('/warehouse/return', body);
  });
});
