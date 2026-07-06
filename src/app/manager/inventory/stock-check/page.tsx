'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { quotationApiService } from '@/services/quotation.service';
import { catalogApiService } from '@/services/catalog.service';
import { inventoryApiService } from '@/services/inventory.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { Item } from '@/types/catalog';

const SOURCE_OPTIONS = [
  { value: 'quotation', label: 'Báo giá đã duyệt' },
  { value: 'manual', label: 'Nhập thủ công' },
];

interface CheckItem {
  rowId: string;
  itemId: string;
  name: string;
  code: string;
  unit: string;
  required: number;
  available: number;
  reserved: number;
  damaged: number;
  shortage: number;
  checked: boolean;
}

function buildRow(item: Item, qty: number): CheckItem {
  return {
    rowId: `${item.itemId}-${Date.now()}`,
    itemId: item.itemId,
    name: item.itemName,
    code: item.itemCode,
    unit: item.unit,
    required: qty,
    available: 0,
    reserved: 0,
    damaged: 0,
    shortage: 0,
    checked: false,
  };
}

function blankRow(): CheckItem {
  return {
    rowId: `manual-${Date.now()}`,
    itemId: '',
    name: 'Thiết bị mới',
    code: '',
    unit: 'Cái',
    required: 1,
    available: 0,
    reserved: 0,
    damaged: 0,
    shortage: 0,
    checked: false,
  };
}

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [source, setSource] = useState('quotation');

  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    Promise.all([
      orderApiService.getOrders({ limit: 200 }).then((r) => (r.data as Order[]) ?? []),
      customerApiService.getCustomers({ limit: 200 }).then((r) => (r.data as Customer[]) ?? []),
    ])
      .then(([ords, custs]) => {
        setOrders(ords);
        setCustomers(custs);
      })
      .finally(() => setIsLoadingOrders(false));
  }, []);

  const customerById = useMemo(() => new Map(customers.map((c) => [c.customerId, c])), [customers]);
  const selectedOrder = useMemo(() => orders.find((o) => o.orderId === selectedOrderId), [orders, selectedOrderId]);
  const selectedCustomer = useMemo(
    () => (selectedOrder ? customerById.get(selectedOrder.customerId) : null),
    [selectedOrder, customerById],
  );

  // Tự điền ngày khi chọn đơn hàng
  useEffect(() => {
    if (selectedOrder?.eventDate) {
      setEventDate(selectedOrder.eventDate.slice(0, 10));
    }
  }, [selectedOrder]);

  // Load thiết bị từ báo giá đã liên kết với đơn hàng (Order.quotationId) khi chọn đơn hàng.
  // Quotation giờ thuộc Customer, Order chỉ tham chiếu 1 quotationId cố định — không còn danh sách
  // nhiều báo giá theo order như trước.
  useEffect(() => {
    if (!selectedOrderId || source !== 'quotation' || !selectedOrder?.quotationId) {
      setCheckItems([]);
      return;
    }
    let cancelled = false;
    setIsLoadingItems(true);
    setCheckItems([]);

    quotationApiService
      .getQuotation(selectedOrder.quotationId)
      .then(async (detail) => {
        if (cancelled) return;
        const items = (detail.data?.items ?? []) as { itemId: string; quantity: number }[];

        const catalogItems = await Promise.all(
          items.map((it) =>
            catalogApiService
              .getItem(it.itemId)
              .then((r) => ({ item: r.data as Item, qty: it.quantity }))
              .catch(() => null),
          ),
        );
        if (cancelled) return;
        const rows = catalogItems
          .filter((e): e is { item: Item; qty: number } => e !== null && !!e.item)
          .map(({ item, qty }) => buildRow(item, qty));
        setCheckItems(rows);
      })
      .catch(() => setCheckItems([]))
      .finally(() => {
        if (!cancelled) setIsLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedOrderId, source, selectedOrder]);

  const handleCheck = () => {
    if (!eventDate || checkItems.length === 0) return;
    setIsChecking(true);
    Promise.all(
      checkItems.map((item) =>
        item.itemId
          ? inventoryApiService
              .getInventory({ itemId: item.itemId, limit: 1 })
              .then((res) => res.data?.[0] ?? null)
              .catch(() => null)
          : Promise.resolve(null),
      ),
    ).then((inventories) => {
      setCheckItems((prev) =>
        prev.map((item, idx) => {
          const inv = inventories[idx];
          const available = inv?.quantityAvailable ?? 0;
          const reserved = inv?.quantityReserved ?? 0;
          const damaged = inv?.quantityDamaged ?? 0;
          const shortage = Math.max(0, item.required - available);
          return { ...item, available, reserved, damaged, shortage, checked: true };
        }),
      );
      setIsChecking(false);
    });
  };

  const addItem = () => setCheckItems((prev) => [...prev, blankRow()]);

  const removeItem = (rowId: string) => setCheckItems((prev) => prev.filter((i) => i.rowId !== rowId));

  const updateRequired = (rowId: string, value: number) => {
    setCheckItems((prev) =>
      prev.map((item) => {
        if (item.rowId !== rowId) return item;
        const shortage = item.checked ? Math.max(0, value - item.available) : 0;
        return { ...item, required: value, shortage };
      }),
    );
  };

  const orderOptions = useMemo(
    () => [
      { value: '', label: '— Chọn đơn hàng —' },
      ...orders.map((o) => ({
        value: o.orderId,
        label: `${o.orderCode} — ${customerById.get(o.customerId)?.customerName ?? 'Khách hàng'}`,
      })),
    ],
    [orders, customerById],
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">Kiểm tra tồn kho</h1>
      <p className="mt-1 text-sm text-slate-500">Kiểm tra khả dụng thiết bị theo đơn hàng và ngày sự kiện.</p>

      {/* ── Thiết lập + Thông tin đơn hàng ─────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form thiết lập */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-slate-800">Thiết lập kiểm tra tồn kho</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Nhập các tham số đầu vào để quét dữ liệu khả dụng thực tế của kho vật tư.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Đơn hàng</label>
              <Select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                options={isLoadingOrders ? [{ value: '', label: 'Đang tải...' }] : orderOptions}
                disabled={isLoadingOrders}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Ngày diễn ra sự kiện</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-blue-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nguồn danh sách thiết bị</label>
              <Select value={source} onChange={(e) => setSource(e.target.value)} options={SOURCE_OPTIONS} />
            </div>
          </div>

          <div className="mt-5">
            <Button
              onClick={handleCheck}
              isLoading={isChecking}
              disabled={!selectedOrderId || !eventDate || checkItems.length === 0 || isLoadingItems}
            >
              Kiểm tra khả dụng
            </Button>
          </div>
        </motion.div>

        {/* Thông tin đơn hàng */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <FileText className="h-4 w-4" />
            Thông tin đơn hàng
          </div>

          {selectedOrder ? (
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Mã đơn hàng</dt>
                <dd>
                  <Link href={`/manager/orders/${selectedOrder.orderId}`} className="font-semibold text-blue-600 hover:underline">
                    {selectedOrder.orderCode}
                  </Link>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Khách hàng</dt>
                <dd className="text-right font-semibold text-slate-800">{selectedCustomer?.customerName ?? '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Loại sự kiện</dt>
                <dd className="text-slate-600">{selectedOrder.eventType}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Ngày tổ chức</dt>
                <dd className="font-semibold text-slate-800">{selectedOrder.eventDate?.slice(0, 10) ?? '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Địa điểm</dt>
                <dd className="max-w-[140px] truncate text-right font-semibold text-slate-800" title={selectedOrder.location}>
                  {selectedOrder.location}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm italic text-slate-400">Chọn đơn hàng để xem thông tin.</p>
          )}
        </motion.div>
      </div>

      {/* ── Danh sách thiết bị ──────────────────────────────────────── */}
      {selectedOrderId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-8"
        >
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Danh sách thiết bị cần kiểm tra</h2>
              {eventDate && (
                <p className="mt-0.5 text-sm text-slate-500">
                  Thời gian cập nhật tự động theo mốc sự kiện ngày {eventDate}
                </p>
              )}
            </div>
            <button type="button" onClick={addItem} className="text-sm font-semibold text-blue-600 hover:underline">
              + Thêm thiết bị cần check
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {isLoadingItems ? (
              <p className="px-6 py-8 text-center text-sm italic text-slate-400">Đang tải danh sách thiết bị...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100">
                    <tr>
                      {['Thiết bị', 'Mã thiết bị', 'Đơn vị', 'Yêu cầu', 'Có sẵn', 'Đã giữ chỗ', 'Hỏng', 'Thiếu', 'Trạng thái', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {checkItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm italic text-slate-400">
                          Không có thiết bị nào.{' '}
                          {source === 'quotation'
                            ? 'Đơn hàng chưa có báo giá liên kết.'
                            : 'Nhấn "+ Thêm thiết bị cần check" để thêm thủ công.'}
                        </td>
                      </tr>
                    ) : (
                      checkItems.map((item) => {
                        const isShort = item.checked && item.shortage > 0;
                        const isOk = item.checked && item.shortage === 0;
                        return (
                          <tr key={item.rowId} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.code || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={1}
                                value={item.required}
                                onChange={(e) => updateRequired(item.rowId, Math.max(1, Number(e.target.value)))}
                                className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-slate-700">{item.checked ? item.available : '—'}</td>
                            <td className="px-4 py-3 text-slate-700">{item.checked ? item.reserved : '—'}</td>
                            <td className="px-4 py-3 text-slate-700">{item.checked ? item.damaged : '—'}</td>
                            <td className={`px-4 py-3 font-bold ${isShort ? 'text-red-500' : 'text-slate-700'}`}>
                              {item.checked ? item.shortage : '—'}
                            </td>
                            <td className="px-4 py-3">
                              {!item.checked ? (
                                <span className="text-xs italic text-slate-400">Chưa kiểm tra</span>
                              ) : isOk ? (
                                <Badge variant="success">Đủ hàng</Badge>
                              ) : (
                                <Badge variant="error">Thiếu hàng</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => removeItem(item.rowId)}
                                className="rounded p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                aria-label="Xóa dòng"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
