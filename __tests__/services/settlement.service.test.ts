/**
 * @file settlement.service.test.ts
 * Unit tests for the Settlement API Service wrapper sau đợt refactor 2026-07-06 (types/settlement.ts).
 */

jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn().mockReturnThis(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
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
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

import api from '../../src/services/api';
import { settlementApiService } from '../../src/services/settlement.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('settlementApiService — getOrderSettlement()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /orders/{orderId}/settlement', async () => {
    const mockResponse = { data: { success: true, data: null } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await settlementApiService.getOrderSettlement('order-2');

    expect(mockApi.get).toHaveBeenCalledWith('/orders/order-2/settlement');
  });
});

describe('settlementApiService — recordSettlement()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /orders/{orderId}/settlement with additionalFee (singular)', async () => {
    const mockResponse = { data: { success: true, data: { settlementId: 'st-1' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await settlementApiService.recordSettlement('order-2', {
      additionalFee: 2_500_000,
      compensation: 450_000,
      discount: 0,
      paymentMethod: 'cash',
    });

    expect(mockApi.post).toHaveBeenCalledWith('/orders/order-2/settlement', {
      additionalFee: 2_500_000,
      compensation: 450_000,
      discount: 0,
      paymentMethod: 'cash',
    });
  });
});

describe('settlementApiService — confirmSettlement()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /settlements/{settlementId}/confirm', async () => {
    const mockResponse = { data: { success: true, message: 'Xác nhận quyết toán thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await settlementApiService.confirmSettlement('st-1', { status: 'CONFIRMED' });

    expect(mockApi.put).toHaveBeenCalledWith('/settlements/st-1/confirm', { status: 'CONFIRMED' });
  });
});
