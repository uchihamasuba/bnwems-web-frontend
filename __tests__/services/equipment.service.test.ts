/**
 * @file equipment.service.test.ts
 * Unit tests for the Equipment API Service wrapper (docs/api/03-catalog.md).
 * Equipment is the renamed CatalogItem entity ("formerly CatalogItem" per the doc).
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
import { equipmentApiService } from '../../src/services/equipment.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('equipmentApiService — getEquipment()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /equipment with query params (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, data: [], meta: { page: 1, limit: 20, totalCount: 0 } } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await equipmentApiService.getEquipment({ page: 1, limit: 20, search: 'loa', category: 'Âm thanh', status: 'active' });

    expect(mockApi.get).toHaveBeenCalledWith('/equipment', {
      params: { page: 1, limit: 20, search: 'loa', category: 'Âm thanh', status: 'active' },
    });
  });
});

describe('equipmentApiService — createEquipment()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /equipment with payload (UC 2.5)', async () => {
    const payload = {
      code: 'SPK-002',
      name: 'Loa Bose L1',
      category: 'Âm thanh',
      unit: 'bộ',
      rentalPrice: 150000,
      costPrice: 100000,
      replacementValue: 2500000,
    };
    const mockResponse = {
      data: { success: true, message: 'Equipment created successfully.', data: { equipmentItemId: 'eq-10' } },
    };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await equipmentApiService.createEquipment(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/equipment', payload);
    expect(result.data.equipmentItemId).toBe('eq-10');
  });
});

describe('equipmentApiService — updateEquipment()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /equipment/{id} with payload (UC 2.5)', async () => {
    const mockResponse = { data: { success: true, message: 'Equipment updated successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await equipmentApiService.updateEquipment('eq-10', {
      name: 'Loa Bose L1 Pro',
      category: 'Âm thanh',
      unit: 'bộ',
      rentalPrice: 160000,
      costPrice: 110000,
      replacementValue: 2600000,
    });

    expect(mockApi.put).toHaveBeenCalledWith('/equipment/eq-10', {
      name: 'Loa Bose L1 Pro',
      category: 'Âm thanh',
      unit: 'bộ',
      rentalPrice: 160000,
      costPrice: 110000,
      replacementValue: 2600000,
    });
  });
});

describe('equipmentApiService — updateEquipmentStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PATCH /equipment/{id}/status with status (UC 2.4)', async () => {
    const mockResponse = { data: { success: true, message: 'Equipment status changed successfully.' } };
    (mockApi.patch as jest.Mock).mockResolvedValue(mockResponse);

    await equipmentApiService.updateEquipmentStatus('eq-10', { status: 'inactive' });

    expect(mockApi.patch).toHaveBeenCalledWith('/equipment/eq-10/status', { status: 'inactive' });
  });
});
