/**
 * @file order.service.test.ts
 * Unit tests for orderApiService.createOrder — xác nhận payload (bao gồm eventEndDate/eventType/
 * guestCount, mới thêm khi backend hỗ trợ — xem docs/more-require.md mục s/u/w) được gửi đúng lên
 * POST /orders. Cũng test updateOrder (endpoint suy đoán, mục z) và changeOrderDate.
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

  it('gửi đúng payload đầy đủ (customerId, eventDate, venueAddress, eventEndDate, eventType, guestCount)', async () => {
    const responseData = { success: true, data: { id: '123' } };
    mockedPost.mockResolvedValue({ data: responseData });

    const payload = {
      customerId: '1',
      eventDate: '2026-12-01T00:00:00.000Z',
      venueAddress: '123 Đường ABC, Quận 1, TP.HCM',
      eventEndDate: '2026-12-02T00:00:00.000Z',
      eventType: 'Tiệc cưới',
      guestCount: 200,
    };

    const result = await orderApiService.createOrder(payload);

    expect(mockedPost).toHaveBeenCalledWith('/orders', payload);
    expect(result).toEqual(responseData);
  });

  it('vẫn hoạt động khi chỉ có field bắt buộc (customerId, eventDate, venueAddress)', async () => {
    const responseData = { success: true, data: { id: '124' } };
    mockedPost.mockResolvedValue({ data: responseData });

    const payload = {
      customerId: '2',
      eventDate: '2026-12-05T00:00:00.000Z',
      venueAddress: '456 Đường XYZ, Quận 3, TP.HCM',
    };

    const result = await orderApiService.createOrder(payload);

    expect(mockedPost).toHaveBeenCalledWith('/orders', payload);
    expect(result).toEqual(responseData);
  });
});

describe('orderApiService.updateOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi đúng payload lên PUT /orders/:id (endpoint suy đoán, xem docs/more-require.md mục z)', async () => {
    const responseData = { success: true, data: { orderId: '123' } };
    mockedPut.mockResolvedValue({ data: responseData });

    const payload = {
      venueAddress: '123 Đường ABC, Quận 1, TP.HCM',
      eventType: 'Tiệc cưới',
      eventEndDate: '2026-12-02T00:00:00.000Z',
      guestCount: 200,
    };

    const result = await orderApiService.updateOrder('123', payload);

    expect(mockedPut).toHaveBeenCalledWith('/orders/123', payload);
    expect(result).toEqual(responseData);
  });
});

describe('orderApiService.changeOrderDate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi đúng payload lên PUT /orders/:id/change-date với field newEventDate', async () => {
    const responseData = { success: true, message: 'Order date updated.' };
    mockedPut.mockResolvedValue({ data: responseData });

    const payload = { newEventDate: '2026-12-10T00:00:00.000Z' };

    const result = await orderApiService.changeOrderDate('123', payload);

    expect(mockedPut).toHaveBeenCalledWith('/orders/123/change-date', payload);
    expect(result).toEqual(responseData);
  });
});
