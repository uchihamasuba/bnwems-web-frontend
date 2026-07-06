'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AxiosError } from 'axios';
import { Package, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { orderApiService } from '@/services/order.service';
import { EVENT_TYPES } from '@/constants/order-event-type';
import type { Customer } from '@/types/customer';

const EVENT_TYPE_OPTIONS = EVENT_TYPES.map((t) => ({ value: t, label: t }));

interface CreateOrderModalProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrderModal({ isOpen, customers, onClose, onCreated }: Readonly<CreateOrderModalProps>) {
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestCount, setGuestCount] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerFieldRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = useMemo(() => {
    const term = customerQuery.trim().toLowerCase();
    if (!term) return customers.slice(0, 8);
    return customers.filter((c) => c.fullName.toLowerCase().includes(term) || c.phone.includes(term)).slice(0, 8);
  }, [customers, customerQuery]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.customerId === customerId) ?? null,
    [customers, customerId],
  );

  useEffect(() => {
    if (!isCustomerDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (customerFieldRef.current && !customerFieldRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCustomerDropdownOpen]);

  const resetAndClose = () => {
    setCustomerQuery('');
    setCustomerId('');
    setIsCustomerDropdownOpen(false);
    setEventType('');
    setEventDate('');
    setEventEndDate('');
    setVenueAddress('');
    setGuestCount('');
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.customerId);
    setCustomerQuery(customer.fullName);
    setIsCustomerDropdownOpen(false);
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!customerId) next.customerId = 'Vui lòng chọn khách hàng';

    // So sánh trực tiếp chuỗi "YYYY-MM-DD" (giá trị gốc của input date, theo giờ địa phương) thay vì
    // `new Date(eventDate) <= new Date(...)` — chuỗi date-only bị `new Date()` hiểu là UTC trong khi
    // `new Date().toDateString()` lại là giờ địa phương, lệch múi giờ khiến chọn "hôm nay" bị lọt qua
    // validate ở FE rồi mới bị backend từ chối (BR-11-02 docs/api/09-orders.md: phải ở tương lai).
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (!eventDate) {
      next.eventDate = 'Vui lòng chọn ngày tổ chức';
    } else if (eventDate <= todayStr) {
      next.eventDate = 'Ngày tổ chức phải sau ngày hôm nay';
    }

    if (eventEndDate && eventDate && eventEndDate < eventDate) {
      next.eventEndDate = 'Ngày kết thúc không được trước ngày tổ chức';
    }

    if (!venueAddress.trim()) next.venueAddress = 'Vui lòng nhập địa điểm tổ chức';

    if (guestCount && Number(guestCount) < 1) next.guestCount = 'Số lượng khách phải lớn hơn 0';

    return next;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await orderApiService.createOrder({
        customerId,
        eventDate: new Date(eventDate).toISOString(),
        venueAddress: venueAddress.trim(),
        ...(eventEndDate ? { eventEndDate: new Date(eventEndDate).toISOString() } : {}),
        ...(eventType ? { eventType } : {}),
        ...(guestCount ? { guestCount: Number(guestCount) } : {}),
      });
      resetAndClose();
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setSubmitError(axiosError.response?.data?.message ?? 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Tạo đơn hàng mới"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Tạo đơn hàng
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Thông tin khách hàng</h3>
          </div>

          <div ref={customerFieldRef} className="relative">
            <Input
              label="Khách hàng"
              required
              error={errors.customerId}
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value);
                setCustomerId('');
                setIsCustomerDropdownOpen(true);
              }}
              onFocus={() => setIsCustomerDropdownOpen(true)}
              placeholder="Gõ tên hoặc số điện thoại để tìm"
              autoComplete="off"
            />
            {isCustomerDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredCustomers.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-500">Không tìm thấy khách hàng</p>
                ) : (
                  <ul className="max-h-56 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <li key={c.customerId}>
                        <button
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <span className="font-medium text-gray-900">{c.fullName}</span>
                          <span className="text-xs text-gray-500">{c.phone}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-3">
              <span>
                <span className="text-slate-400">SĐT: </span>
                {selectedCustomer.phone}
              </span>
              <span>
                <span className="text-slate-400">Email: </span>
                {selectedCustomer.email || '—'}
              </span>
              <span>
                <span className="text-slate-400">Địa chỉ: </span>
                {selectedCustomer.address || '—'}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Thông tin đơn hàng</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Loại sự kiện"
              placeholder="Chọn loại sự kiện"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              options={EVENT_TYPE_OPTIONS}
            />
            <Input
              type="date"
              label="Ngày tổ chức"
              required
              value={eventDate}
              error={errors.eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <Input
              type="date"
              label="Ngày kết thúc"
              value={eventEndDate}
              error={errors.eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
            />
            <Input
              type="number"
              label="Số lượng khách"
              min={1}
              placeholder="VD: 200"
              value={guestCount}
              error={errors.guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
            <div className="sm:col-span-2">
              <Input
                label="Tên địa điểm"
                required
                placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                value={venueAddress}
                error={errors.venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </div>
    </Modal>
  );
}
