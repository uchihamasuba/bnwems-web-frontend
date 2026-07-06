'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Star, Package, Users, Award, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import AddSupplierModal from '@/components/suppliers/AddSupplierModal';
import CreateProcurementModal from '@/components/suppliers/CreateProcurementModal';
import { supplierApiService } from '@/services/supplier.service';
import { procurementApiService } from '@/services/procurement.service';
import { orderApiService } from '@/services/order.service';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Supplier } from '@/types/supplier';
import type { SupplierTransaction } from '@/types/procurement';
import type { Order } from '@/types/order';

type Tab = 'suppliers' | 'orders';

const SERVICE_CATEGORIES = [
  { value: '', label: 'Tất cả danh mục dịch vụ' },
  { value: 'Hoa tươi & trang trí', label: 'Hoa tươi & trang trí' },
  { value: 'Âm thanh & ánh sáng', label: 'Âm thanh & ánh sáng' },
  { value: 'Thiết bị sự kiện', label: 'Thiết bị sự kiện' },
  { value: 'Trang trí tiệc cưới', label: 'Trang trí tiệc cưới' },
  { value: 'Phương tiện vận chuyển', label: 'Phương tiện vận chuyển' },
];

function procStatusLabel(status: string): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } {
  if (status === 'approved') return { label: 'Approved', variant: 'success' };
  if (status === 'waiting_for_approval') return { label: 'Waiting for Approval', variant: 'warning' };
  if (status === 'received') return { label: 'Received', variant: 'success' };
  if (status === 'returned') return { label: 'Returned', variant: 'neutral' };
  if (status === 'cancelled') return { label: 'Cancelled', variant: 'error' };
  return { label: 'Draft', variant: 'neutral' };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </span>
  );
}

export default function Page() {
  const [tab, setTab] = useState<Tab>('suppliers');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreateProcOpen, setIsCreateProcOpen] = useState(false);

  const loadSuppliers = useCallback(() => {
    setIsLoadingSuppliers(true);
    supplierApiService
      .getSuppliers({ limit: 200 })
      .then((res) => setSuppliers(res.data))
      .catch(() => setSuppliers([]))
      .finally(() => setIsLoadingSuppliers(false));
  }, []);

  const loadTransactions = useCallback(() => {
    setIsLoadingOrders(true);
    procurementApiService
      .getTransactions({ limit: 200 })
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]))
      .finally(() => setIsLoadingOrders(false));
  }, []);

  useEffect(() => {
    loadSuppliers();
    loadTransactions();
    orderApiService.getOrders({ limit: 200 }).then((res) => setOrders((res.data as Order[]) ?? []));
  }, [loadSuppliers, loadTransactions]);

  const filteredSuppliers = useMemo(() => {
    const term = supplierSearch.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (categoryFilter && s.serviceCategory !== categoryFilter) return false;
      if (!term) return true;
      return s.name.toLowerCase().includes(term) || s.serviceCategory.toLowerCase().includes(term);
    });
  }, [suppliers, supplierSearch, categoryFilter]);

  const filteredTransactions = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter(
      (t) =>
        t.orderId.toLowerCase().includes(term) ||
        t.itemDescription.toLowerCase().includes(term) ||
        (t.supplierName?.toLowerCase().includes(term) ?? false),
    );
  }, [transactions, orderSearch]);

  const activeCount = suppliers.filter((s) => s.status === 'active').length;
  const fiveStarCount = suppliers.filter((s) => s.rating === 5).length;

  return (
    <div className="p-6">
      {/* ── Tab header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab('suppliers')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'suppliers' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4" />
            Danh sách nhà cung cấp
          </button>
          <button
            type="button"
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Truck className="h-4 w-4" />
            Đơn mua sắm / Thuê NCC
          </button>
        </div>

        {tab === 'suppliers' ? (
          <Button onClick={() => setIsAddSupplierOpen(true)}>+ Thêm Nhà cung cấp</Button>
        ) : (
          <Button onClick={() => setIsCreateProcOpen(true)}>+ Khởi tạo đơn mua sắm</Button>
        )}
      </div>

      {/* ── Suppliers tab ───────────────────────────────────────────── */}
      {tab === 'suppliers' && (
        <motion.div key="suppliers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          {/* KPI cards */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Đối tác liên kết', value: `${suppliers.length} NCC`, icon: Users, color: 'text-slate-700' },
              { label: 'Đang hoạt động (Active)', value: `${activeCount} đối tác`, icon: Package, color: 'text-green-600' },
              { label: 'Xếp hạng 5 sao', value: `${fiveStarCount} đối tác`, icon: Award, color: 'text-blue-600' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                <p className={`mt-2 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                placeholder="Tìm theo tên nhà cung cấp hoặc dịch vụ cung cấp..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-56">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={SERVICE_CATEGORIES} />
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    {['Mã đối tác', 'Tên nhà cung cấp', 'Dịch vụ cung ứng', 'Điện thoại liên hệ', 'Địa chỉ trụ sở', 'Đánh giá sao', 'Trạng thái', 'Thao tác'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingSuppliers ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm italic text-slate-400">Đang tải...</td></tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm italic text-slate-400">Không có nhà cung cấp nào.</td></tr>
                  ) : filteredSuppliers.map((sup, i) => (
                    <tr key={sup.supplierId} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono text-sm font-bold text-blue-600">
                        SUP-{String(i + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{sup.name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {sup.serviceCategory || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{sup.phone}</td>
                      <td className="max-w-[180px] px-4 py-3 truncate text-slate-400" title={sup.address}>
                        {sup.address || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={sup.rating} />
                      </td>
                      <td className="px-4 py-3">
                        {sup.status === 'active' ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="neutral">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button type="button" className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600" aria-label="Sửa">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button type="button" className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Xóa">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Procurement orders tab ───────────────────────────────────── */}
      {tab === 'orders' && (
        <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
          {/* Search */}
          <div className="mt-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Tìm đơn mua theo mã hợp đồng sự kiện, dịch vụ hoặc nhà cung cấp..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100">
                  <tr>
                    {['Mã đơn mua', 'Mã sự kiện liên kết', 'Nhà cung cấp đối tác', 'Hạng mục mua sắm/Thuê ngoài', 'Chi phí ước tính', 'Chi đặt cọc NCC', 'Trạng thái mua hàng', 'Thao tác'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingOrders ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm italic text-slate-400">Đang tải...</td></tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-sm italic text-slate-400">Không có đơn mua sắm nào.</td></tr>
                  ) : filteredTransactions.map((tx, i) => {
                    const { label, variant } = procStatusLabel(tx.status);
                    return (
                      <tr key={tx.supplierTransactionId} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono text-sm font-bold text-blue-600">
                          PROC-{String(i + 1).padStart(3, '0')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{tx.orderId}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{tx.supplierName ?? tx.supplierId}</td>
                        <td className="max-w-[220px] px-4 py-3 text-slate-600">{tx.itemDescription}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(tx.totalCost)}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{formatCurrency(tx.depositAmount)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={variant}>{label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600" aria-label="Sửa">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button type="button" className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500" aria-label="Xóa">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      <AddSupplierModal
        isOpen={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onSuccess={loadSuppliers}
      />
      <CreateProcurementModal
        isOpen={isCreateProcOpen}
        suppliers={suppliers}
        orders={orders}
        onClose={() => setIsCreateProcOpen(false)}
        onSuccess={loadTransactions}
      />
    </div>
  );
}
