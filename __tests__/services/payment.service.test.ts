/**
 * @file payment.service.test.ts
 * Unit tests for the Deposit API Service wrapper (thay Payment cũ — xem types/payment.ts).
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
import { paymentApiService } from '../../src/services/payment.service';

const mockApi = api as jest.Mocked<typeof api>;

describe('paymentApiService — getOrderDeposits()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /orders/{orderId}/deposits', async () => {
    const mockResponse = { data: { success: true, data: [] } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.getOrderDeposits('order-2');

    expect(mockApi.get).toHaveBeenCalledWith('/orders/order-2/deposits');
  });
});

describe('paymentApiService — createOrderDeposit()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /orders/{orderId}/deposits with exact body', async () => {
    const mockResponse = { data: { success: true, data: { depositId: 'dep-1' } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.createOrderDeposit('order-2', { amount: 25_000_000, paymentMethod: 'bank_transfer' });

    expect(mockApi.post).toHaveBeenCalledWith('/orders/order-2/deposits', {
      amount: 25_000_000,
      paymentMethod: 'bank_transfer',
    });
  });
});

describe('paymentApiService — updateDepositStatus()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /deposits/{depositId}', async () => {
    const mockResponse = { data: { success: true, message: 'Cập nhật trạng thái tiền cọc thành công.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.updateDepositStatus('dep-1', { status: 'SUCCESS' });

    expect(mockApi.put).toHaveBeenCalledWith('/deposits/dep-1', { status: 'SUCCESS' });
  });
});
