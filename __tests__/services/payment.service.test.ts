/**
 * @file payment.service.test.ts
 * Unit tests for the Payment API Service wrapper (docs/api/11-payments-settlement.md, UC 2.19).
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

describe('paymentApiService — getPaymentsByOrder()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call GET /orders/{orderId}/payments', async () => {
    const mockResponse = { data: { success: true, data: [] } };
    (mockApi.get as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.getPaymentsByOrder('order-2');

    expect(mockApi.get).toHaveBeenCalledWith('/orders/order-2/payments');
  });
});

describe('paymentApiService — requestPayment()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call POST /orders/{orderId}/payments/request with exact body', async () => {
    const mockResponse = { data: { success: true, data: { id: 'pr-1', paymentUrl: null } } };
    (mockApi.post as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.requestPayment('order-2', { amount: 25_000_000, paymentType: 'deposit', paymentMethod: 'bank_transfer' });

    expect(mockApi.post).toHaveBeenCalledWith('/orders/order-2/payments/request', {
      amount: 25_000_000,
      paymentType: 'deposit',
      paymentMethod: 'bank_transfer',
    });
  });
});

describe('paymentApiService — confirmPaymentRequest()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should call PUT /payments/{paymentRequestId}/confirm — NOT /payments/{paymentId}/confirm', async () => {
    const mockResponse = { data: { success: true, message: 'Payment confirmed successfully.' } };
    (mockApi.put as jest.Mock).mockResolvedValue(mockResponse);

    await paymentApiService.confirmPaymentRequest('pr-1', { status: 'completed', evidenceUrl: 'https://example.com/evidence.png' });

    expect(mockApi.put).toHaveBeenCalledWith('/payments/pr-1/confirm', {
      status: 'completed',
      evidenceUrl: 'https://example.com/evidence.png',
    });
  });
});
