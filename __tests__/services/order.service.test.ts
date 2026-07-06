/**
 * @file order.service.test.ts
 * Unit tests for orderApiService — khớp backend sau đợt refactor 2026-07-06 (types/order.ts,
 * services/order.service.ts).
 */
import { orderApiService } from '@/services/order.service';
import api from '@/services/api';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedPost = api.post as jest.Mock;
const mockedPut = api.put as jest.Mock;

describe('orderApiService.createOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi đúng payload đầy đủ lên POST /orders', async () => {
    const responseData = { success: true, data: { orderId: '123', orderCode: 'ORD-123' } };
    mockedPost.mockResolvedValue({ data: responseData });

    const payload = {
      customerId: '1',
      eventType: 'Tiệc cưới',
      eventDate: '2026-12-01T00:00:00.000Z',
      location: '123 Đường ABC, Quận 1, TP.HCM',
      guestCount: 200,
      items: [{ itemId: '10', quantity: 2, unitPrice: 500000 }],
    };

    const result = await orderApiService.createOrder(payload);

    expect(mockedPost).toHaveBeenCalledWith('/orders', payload);
    expect(result).toEqual(responseData);
  });
});

describe('orderApiService.updateOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi đúng payload lên PUT /orders/:id/status', async () => {
    const responseData = { success: true, message: 'Cập nhật trạng thái đơn hàng thành công.' };
    mockedPut.mockResolvedValue({ data: responseData });

    const payload = { orderStatus: 'CANCELLED' as const, cancelReason: 'Khách hủy' };

    const result = await orderApiService.updateOrderStatus('123', payload);

    expect(mockedPut).toHaveBeenCalledWith('/orders/123/status', payload);
    expect(result).toEqual(responseData);
  });
});

describe('orderApiService.updateOrderItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi đúng payload lên PUT /orders/:id/items (thay toàn bộ danh sách)', async () => {
    const responseData = { success: true, message: 'Cập nhật danh sách thiết bị thành công.' };
    mockedPut.mockResolvedValue({ data: responseData });

    const payload = { items: [{ itemId: '10', quantity: 3, unitPrice: 500000 }] };

    const result = await orderApiService.updateOrderItems('123', payload);

    expect(mockedPut).toHaveBeenCalledWith('/orders/123/items', payload);
    expect(result).toEqual(responseData);
  });
});
