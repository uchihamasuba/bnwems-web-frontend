'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import { orderApiService } from '@/services/order.service';
import { customerApiService } from '@/services/customer.service';
import { quotationApiService } from '@/services/quotation.service';
import { equipmentApiService } from '@/services/equipment.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Order } from '@/types/order';
import type { Customer } from '@/types/customer';
import type { EquipmentItem } from '@/types/equipment';

// Kho mock — doc API KHÔNG có GET /warehouses (đã bỏ, xem docs/more-require.md)
const MOCK_WAREHOUSES = [
  { value: 'wh-1', label: 'Kho tổng' },
  { value: 'wh-2', label: 'Kho dự phòng' },
  { value: 'wh-3', label: 'Kho phụ' },
];

const SOURCE_OPTIONS = [
  { value: 'quotation', label: 'Báo giá đã duyệt' },
  { value: 'manual', label: 'Nhập thủ công' },
];

// MOCK: tính tồn kho giả từ equipmentItemId (backend thật không nối Equipment ↔ Inventory)
// Equipment dùng bảng riêng (equipmentItemId), Inventory dùng catalogItemId — xem more-require.md (aa)
function mockAvailability(equipmentItemId: string, required: number) {
  const seed = equipmentItemId.split('').reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0);
  const total = required + (seed % 10); // đôi khi đủ, đôi khi thiếu
  const reserved = seed % 4;
  const damaged = seed % 3 === 0 ? 1 : 0;
  const available = total;
  const shortage = Math.max(0, required - (available - reserved - damaged));
  return { available, reserved, damaged, shortage };
}

interface CheckItem {
  rowId: string;
  equipmentItemId: string;
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

function buildRow(equipment: EquipmentItem, qty: number): CheckItem {
  return {
    rowId: `${equipment.equipmentItemId}-${Date.now()}`,
    equipmentItemId: equipment.equipmentItemId,
    name: equipment.name,
    code: equipment.code,
    unit: equipment.unit ?? 'Cái',
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
    equipmentItemId: '',
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
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('wh-1');
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

  // Load thiết bị từ báo giá khi chọn đơn hàng
  useEffect(() => {
    if (!selectedOrderId || source !== 'quotation') {
      setCheckItems([]);
      return;
    }
    let cancelled = false;
    setIsLoadingItems(true);
    setCheckItems([]);

    quotationApiService
      .getOrderQuotations(selectedOrderId)
      .then(async (res) => {
        if (cancelled) return;
        const list = (res.data as { quotationId: string; status: string; items?: unknown[] }[]) ?? [];
        const confirmed = list.find((q) => q.status === 'confirmed') ?? list[0];
        if (!confirmed) {
          setIsLoadingItems(false);
          return;
        }
        // Lấy chi tiết báo giá (có items)
        const detail = await quotationApiService.getQuotation(confirmed.quotationId);
        if (cancelled) return;
        const items = (detail.data?.items ?? []) as { equipmentItemId: string; quantity: number }[];

        // Fetch thông tin thiết bị song song
        const equipments = await Promise.all(
          items.map((it) =>
            equipmentApiService
              .getEquipment(it.equipmentItemId)
              .then((r) => ({ eq: r.data as EquipmentItem, qty: it.quantity }))
              .catch(() => null),
          ),
        );
        if (cancelled) return;
        const rows = equipments
          .filter((e): e is { eq: EquipmentItem; qty: number } => e !== null && !!e.eq)
          .map(({ eq, qty }) => buildRow(eq, qty));
        setCheckItems(rows);
      })
      .catch(() => setCheckItems([]))
      .finally(() => {
        if (!cancelled) setIsLoadingItems(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedOrderId, source]);

  const handleCheck = () => {
    if (!eventDate || checkItems.length === 0) return;
    setIsChecking(true);
    // MOCK: backend không nối Equipment ↔ Inventory theo equipmentItemId
    // Dùng giá trị giả lập ổn định theo seed từ equipmentItemId
    setTimeout(() => {
      setCheckItems((prev) =>
        prev.map((item) => {
          const mock = mockAvailability(item.equipmentItemId || item.rowId, item.required);
          return { ...item, ...mock, checked: true };
        }),
      );
      setIsChecking(false);
    }, 600);
  };

  const addItem = () => setCheckItems((prev) => [...prev, blankRow()]);

  const removeItem = (rowId: string) => setCheckItems((prev) => prev.filter((i) => i.rowId !== rowId));

  const updateRequired = (rowId: string, value: number) => {
    setCheckItems((prev) =>
      prev.map((item) => {
        if (item.rowId !== rowId) return item;
        const shortage = item.checked ? Math.max(0, value - (item.available - item.reserved - item.damaged)) : 0;
        return { ...item, required: value, shortage };
      }),
    );
  };

  const orderOptions = useMemo(
    () => [
      { value: '', label: '— Chọn đơn hàng —' },
      ...orders.map((o) => ({
        value: o.orderId,
        label: `${o.orderId} — ${customerById.get(o.customerId)?.fullName ?? 'Khách hàng'}`,
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
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kho kiểm tra</label>
              <Select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                options={MOCK_WAREHOUSES}
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
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                options={SOURCE_OPTIONS}
              />
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
                  <Link
                    href={`/manager/orders/${selectedOrder.orderId}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {selectedOrder.orderId}
                  </Link>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Khách hàng</dt>
                <dd className="text-right font-semibold text-slate-800">
                  {selectedCustomer?.fullName ?? '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Loại sự kiện</dt>
                <dd className="italic text-slate-600" title="Dữ liệu minh họa">
                  {selectedOrder.eventType ?? 'Tiệc cưới'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Ngày tổ chức</dt>
                <dd className="font-semibold text-slate-800">
                  {selectedOrder.eventDate?.slice(0, 10) ?? '—'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-2">
                <dt className="shrink-0 text-slate-400">Địa điểm</dt>
                <dd
                  className="max-w-[140px] truncate text-right font-semibold text-slate-800"
                  title={selectedOrder.eventLocation}
                >
                  {selectedOrder.venueName ?? selectedOrder.eventLocation ?? '—'}
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
            <button
              type="button"
              onClick={addItem}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
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
                      {[
                        'Thiết bị',
                        'Mã thiết bị',
                        'Đơn vị',
                        'Yêu cầu',
                        'Có sẵn',
                        'Đã giữ chỗ',
                        'Hỏng',
                        'Thiếu',
                        'Trạng thái',
                        '',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
                        >
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
                            ? 'Đơn hàng chưa có báo giá hoặc báo giá chưa được xác nhận.'
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
