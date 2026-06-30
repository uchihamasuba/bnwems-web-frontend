/**
 * @file settlement.service.test.ts
 * Unit tests for the Settlement API Service wrapper (docs/api/11-payments-settlement.md, UC 2.19 & 2.30).
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

describe('settlementApiService — recordSettlement()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /orders/{orderId}/settlement with additionalFees (plural)', async () => {
    const mockResponse = { data: { success: true, data: { settlementId: 'st-1' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await settlementApiService.recordSettlement('order-2', {
      originalValue: 50_000_000,
      additionalFees: 2_500_000,
      compensation: 450_000,
      paidAmount: 25_000_000,
      remainingAmount: 27_050_000,
    });

    expect(mockApi.post).toHaveBeenCalledWith('/orders/order-2/settlement', {
      originalValue: 50_000_000,
      additionalFees: 2_500_000,
      compensation: 450_000,
      paidAmount: 25_000_000,
      remainingAmount: 27_050_000,
    });
  });
});

describe('settlementApiService — confirmSettlement()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /settlements/{settlementId}/confirm', async () => {
    const mockResponse = { data: { success: true, message: 'Settlement confirmed.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await settlementApiService.confirmSettlement('st-1', { status: 'confirmed' });

    expect(mockApi.put).toHaveBeenCalledWith('/settlements/st-1/confirm', { status: 'confirmed' });
  });
});

describe('settlementApiService — getSettlementPreviewMock()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should call same-origin mock route, bypassing the `api` axios instance', async () => {
    const mockJson = { success: true, data: { orderId: 'order-2', originalValue: 50_000_000 } };
    (global.fetch as jest.Mock).mockResolvedValue({ json: () => Promise.resolve(mockJson) });

    const result = await settlementApiService.getSettlementPreviewMock('order-2');

    expect(global.fetch).toHaveBeenCalledWith('/api/v1/orders/order-2/settlement-preview');
    expect(mockApi.get).not.toHaveBeenCalled();
    expect(result.data?.orderId).toBe('order-2');
  });
});
