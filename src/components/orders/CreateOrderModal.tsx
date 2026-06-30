'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { orderApiService } from '@/services/order.service';
import type { Customer } from '@/types/customer';

interface CreateOrderModalProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onCreated: (orderId: string) => void;
}

export default function CreateOrderModal({ isOpen, customers, onClose, onCreated }: Readonly<CreateOrderModalProps>) {
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerFieldRef = useRef<HTMLDivElement>(null);

  const filteredCustomers = useMemo(() => {
    const term = customerQuery.trim().toLowerCase();
    if (!term) return customers.slice(0, 8);
    return customers.filter((c) => c.fullName.toLowerCase().includes(term) || c.phone.includes(term)).slice(0, 8);
  }, [customers, customerQuery]);

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
    setEventDate('');
    setEventEndDate('');
    setVenueAddress('');
    setError(null);
    onClose();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.customerId);
    setCustomerQuery(customer.fullName);
    setIsCustomerDropdownOpen(false);
  };

  const handleSubmit = async () => {
    if (!customerId) {
      setError('Vui lòng chọn khách hàng');
      return;
    }
    if (!eventDate) {
      setError('Vui lòng chọn ngày tổ chức');
      return;
    }
    // BR-11-02 (docs/api/09-orders.md): eventDate phải ở tương lai
    if (new Date(eventDate) <= new Date(new Date().toDateString())) {
      setError('Ngày tổ chức phải ở tương lai');
      return;
    }
    if (eventEndDate && new Date(eventEndDate) < new Date(eventDate)) {
      setError('Ngày kết thúc không được trước ngày tổ chức');
      return;
    }
    if (!venueAddress.trim()) {
      setError('Vui lòng nhập địa điểm tổ chức');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await orderApiService.createOrder({
        customerId,
        eventDate: new Date(eventDate).toISOString(),
        venueAddress: venueAddress.trim(),
        ...(eventEndDate ? { eventEndDate: new Date(eventEndDate).toISOString() } : {}),
      });
      onCreated(res.data.id);
      resetAndClose();
    } catch {
      setError('Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Tạo đơn hàng"
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
      <div className="space-y-4">
        <div ref={customerFieldRef} className="relative">
          <Input
            label="Khách hàng"
            required
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
        <Input
          type="date"
          label="Ngày tổ chức"
          required
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <Input
          type="date"
          label="Ngày kết thúc"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          helpText="Hệ thống chưa hỗ trợ lưu ngày kết thúc — chỉ hiển thị tạm trên form"
        />
        <Input
          label="Địa điểm"
          required
          value={venueAddress}
          onChange={(e) => setVenueAddress(e.target.value)}
          placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
