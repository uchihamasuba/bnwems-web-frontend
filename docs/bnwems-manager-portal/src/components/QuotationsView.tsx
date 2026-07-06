import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  DollarSign,
  Printer,
  Copy,
  Clock,
  Check,
  X
} from 'lucide-react';
import { Customer, Order, Quotation, QuotationItem } from '../mockData';

interface QuotationsViewProps {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  customers: Customer[];
  orders: Order[];
  onSelectQuotation: (id: string | null) => void;
  selectedQuotationId: string | null;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
}

// Preset catalog for quick quotation item selection
const ITEM_CATALOG = [
  { name: 'Backdrop hoa lụa cao cấp 4x3m', category: 'Decor', unit: 'Gói', price: 15000000 },
  { name: 'Hệ thống ánh sáng moving head sân khấu', category: 'Audio/Video', unit: 'Set', price: 12000000 },
  { name: 'Bàn Gallery đón khách chủ đề Rustic', category: 'Decor', unit: 'Gói', price: 8000000 },
  { name: 'Âm thanh Line Array d&b audiotechnik', category: 'Audio/Video', unit: 'Buổi', price: 10000000 },
  { name: 'Cổng vòm pha lê & hoa tươi nhập khẩu', category: 'Decor', unit: 'Bộ', price: 35000000 },
  { name: 'Đường dẫn lối đi sân khấu hoa tươi', category: 'Decor', unit: 'Gói', price: 12000000 },
  { name: 'Trang trí bàn tiệc VIP', category: 'Decor', unit: 'Bàn', price: 2000000 },
  { name: 'Màn hình LED P3 Cabin nhôm', category: 'Audio/Video', unit: 'm2', price: 1000000 },
  { name: 'Nhà bạt trong suốt khung truss 10x15m', category: 'Logistics', unit: 'Set', price: 18000000 },
  { name: 'Hệ thống đèn fairy light lung linh', category: 'Decor', unit: 'Gói', price: 7000000 }
];

export default function QuotationsView({
  quotations,
  setQuotations,
  customers,
  orders,
  onSelectQuotation,
  selectedQuotationId,
  currentRoute,
  setCurrentRoute,
}: QuotationsViewProps) {
  
  // Filter variables
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Approved' | 'Rejected'>('All');

  // Creator state
  const [editMode, setEditMode] = useState<boolean>(false); // true if editing instead of creating
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [quotationNotes, setQuotationNotes] = useState('');
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [includeVat, setIncludeVat] = useState(false);
  const [includeServiceCharge, setIncludeServiceCharge] = useState(false);

  // Find active quotation details
  const activeQuotation = quotations.find(q => q.id === selectedQuotationId);

  // KPIs
  const totalQuos = quotations.length;
  const draftQuos = quotations.filter(q => q.status === 'Draft').length;
  const approvedQuos = quotations.filter(q => q.status === 'Approved').length;
  const rejectedQuos = quotations.filter(q => q.status === 'Rejected').length;

  // Filter quotation list
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Load editing quotation when opening the edit route
  useEffect(() => {
    if (currentRoute === 'quotation-create' && selectedQuotationId) {
      const q = quotations.find(quo => quo.id === selectedQuotationId);
      if (q) {
        setEditMode(true);
        setSelectedCustomerId(q.customerId);
        setSelectedOrderId(q.orderId || '');
        setQuotationNotes(q.notes);
        setQuotationItems([...q.items]);
      }
    } else if (currentRoute === 'quotation-create' && !selectedQuotationId) {
      setEditMode(false);
      setSelectedCustomerId('');
      setSelectedOrderId('');
      setQuotationNotes('');
      setQuotationItems([]);
    }
  }, [currentRoute, selectedQuotationId]);

  // Add Item to Quotation
  const handleAddItem = () => {
    const defaultItem = ITEM_CATALOG[0];
    const newItem: QuotationItem = {
      id: `QI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: defaultItem.name,
      category: defaultItem.category,
      unit: defaultItem.unit,
      quantity: 1,
      price: defaultItem.price,
      discount: 0
    };
    setQuotationItems(prev => [...prev, newItem]);
  };

  // Change individual item properties
  const handleItemChange = (itemId: string, field: keyof QuotationItem, value: any) => {
    setQuotationItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // If catalog item name is selected, automatically fill category, unit and price
        if (field === 'name') {
          const matched = ITEM_CATALOG.find(c => c.name === value);
          if (matched) {
            updated.category = matched.category;
            updated.unit = matched.unit;
            updated.price = matched.price;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  // Remove individual item
  const handleRemoveItem = (itemId: string) => {
    setQuotationItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Pricing calculations
  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountTotal = quotationItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    const preTaxTotal = Math.max(0, subtotal - discountTotal);
    const vatAmount = includeVat ? Math.round(preTaxTotal * 0.08) : 0;
    const serviceChargeAmount = includeServiceCharge ? Math.round(preTaxTotal * 0.05) : 0;
    const totalAmount = preTaxTotal + vatAmount + serviceChargeAmount;
    return { subtotal, discountTotal, preTaxTotal, vatAmount, serviceChargeAmount, totalAmount };
  };

  // Save Quotation (Create / Update)
  const handleSaveQuotation = (status: 'Draft' | 'Approved') => {
    if (!selectedCustomerId) {
      alert("Vui lòng chọn khách hàng.");
      return;
    }
    if (quotationItems.length === 0) {
      alert("Vui lòng thêm ít nhất một hạng mục báo giá.");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customer ? customer.name : 'Unknown';
    const { subtotal, discountTotal, totalAmount } = calculateTotals();

    if (editMode && selectedQuotationId) {
      // Edit
      setQuotations(prev => prev.map(q => q.id === selectedQuotationId ? {
        ...q,
        customerId: selectedCustomerId,
        customerName,
        orderId: selectedOrderId || undefined,
        notes: quotationNotes,
        items: quotationItems,
        subtotal,
        discountTotal,
        totalAmount,
        status
      } : q));
      alert("Cập nhật báo giá thành công!");
    } else {
      // Create
      const newQuoId = `QUO-${String(quotations.length + 1).padStart(3, '0')}`;
      const newQuo: Quotation = {
        id: newQuoId,
        customerId: selectedCustomerId,
        customerName,
        orderId: selectedOrderId || undefined,
        version: 'v1.0',
        notes: quotationNotes,
        items: quotationItems,
        subtotal,
        discountTotal,
        totalAmount,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Manager Binh',
        status
      };
      setQuotations(prev => [newQuo, ...prev]);
      alert("Khởi tạo báo giá mới thành công!");
    }
    onSelectQuotation(null);
    setCurrentRoute('quotations');
  };

  // Delete Draft Quotation
  const handleDeleteDraft = (quoId: string) => {
    if (confirm(`Bạn có chắc muốn xóa bản nháp báo giá ${quoId}?`)) {
      setQuotations(prev => prev.filter(q => q.id !== quoId));
      onSelectQuotation(null);
      setCurrentRoute('quotations');
    }
  };

  // Approve/Reject from Details
  const handleSetStatus = (quoId: string, status: 'Draft' | 'Approved' | 'Rejected') => {
    setQuotations(prev => prev.map(q => q.id === quoId ? { ...q, status } : q));
  };

  // 1. LIST SCREEN
  if (currentRoute === 'quotations') {
    return (
      <div id="quotations-list-view" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Danh sách báo giá</h1>
            <p className="text-gray-500 text-sm mt-0.5">Khởi tạo và quản trị các phiên bản báo giá dịch vụ gửi khách hàng.</p>
          </div>
          <button
            onClick={() => { onSelectQuotation(null); setCurrentRoute('quotation-create'); }}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer animate-pulse"
          >
            <Plus className="w-4 h-4" />
            Tạo báo giá mới
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xs text-gray-400 font-bold block uppercase">Tổng số báo giá</span>
            <span className="text-xl font-bold text-gray-800 mt-1 block">{totalQuos}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Bản nháp (Draft)</span>
            <span className="text-xl font-bold text-amber-500 mt-1 block">{draftQuos}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Đã duyệt (Approved)</span>
            <span className="text-xl font-bold text-green-600 mt-1 block">{approvedQuos}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
            <span className="text-xs text-gray-400 font-bold block uppercase">Bị từ chối (Rejected)</span>
            <span className="text-xl font-bold text-red-500 mt-1 block">{rejectedQuos}</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã báo giá hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Draft">Draft (Nháp)</option>
              <option value="Approved">Approved (Đã duyệt)</option>
              <option value="Rejected">Rejected (Bị từ chối)</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã báo giá</th>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Phiên bản</th>
                  <th className="px-6 py-4">Tổng tiền cuối</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      Không tìm thấy báo giá nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quo) => (
                    <tr key={quo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#2563EB]">{quo.id}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500">{quo.orderId || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{quo.customerName}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold">{quo.version}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{quo.totalAmount.toLocaleString('vi-VN')} đ</td>
                      <td className="px-6 py-4 text-gray-400">{quo.createdAt}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          quo.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                          quo.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {quo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { onSelectQuotation(quo.id); setCurrentRoute('quotation-detail'); }}
                            className="p-1.5 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {quo.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => { onSelectQuotation(quo.id); setCurrentRoute('quotation-create'); }}
                                className="p-1.5 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                                title="Sửa bản nháp"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDraft(quo.id)}
                                className="p-1.5 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Xóa bản nháp"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. DETAIL SCREEN
  if (currentRoute === 'quotation-detail' && activeQuotation) {
    const formatNumberToWords = (num: number): string => {
      if (num === 0) return "Không đồng";
      const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
      const unitsTen = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
      
      function readGroup(group: number): string {
        let result = "";
        const hundred = Math.floor(group / 100);
        const ten = Math.floor((group % 100) / 10);
        const unit = group % 10;
        
        if (hundred > 0) {
          result += units[hundred] + " trăm ";
          if (ten === 0 && unit > 0) {
            result += "lẻ ";
          }
        }
        
        if (ten > 0) {
          result += unitsTen[ten] + " ";
        }
        
        if (unit > 0) {
          if (ten > 1 && unit === 1) {
            result += "mốt";
          } else if (ten > 0 && unit === 5) {
            result += "lăm";
          } else if (ten === 0 && unit === 5) {
            result += "năm";
          } else {
            result += units[unit];
          }
        }
        return result.trim();
      }
      
      let result = "";
      let temp = num;
      const billions = Math.floor(temp / 1000000000);
      temp %= 1000000000;
      const millions = Math.floor(temp / 1000000);
      temp %= 1000000;
      const thousands = Math.floor(temp / 1000);
      temp %= 1000;
      const hundreds = temp;
      
      if (billions > 0) {
        result += readGroup(billions) + " tỷ ";
      }
      if (millions > 0) {
        result += readGroup(millions) + " triệu ";
      }
      if (thousands > 0) {
        result += readGroup(thousands) + " nghìn ";
      }
      if (hundreds > 0) {
        result += readGroup(hundreds) + " ";
      }
      
      let finalStr = result.trim();
      if (finalStr) {
        finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1) + " đồng chẵn.";
      } else {
        finalStr = "Không đồng chẵn.";
      }
      return finalStr;
    };

    const formatDateString = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    };

    const displayStatusVN = (status: string) => {
      if (status === 'Draft') return 'Nháp';
      if (status === 'Approved') return 'Đã duyệt';
      if (status === 'Rejected') return 'Bác bỏ';
      return status;
    };

    return (
      <div id="quotation-detail-view" className="space-y-6 animate-fade-in pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => setCurrentRoute('quotations')}>Manager</span>
          <span>&rsaquo;</span>
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => setCurrentRoute('quotations')}>Báo giá</span>
          <span>&rsaquo;</span>
          <span className="text-slate-800 font-bold">Chi tiết báo giá</span>
        </div>

        {/* View Header with main actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentRoute('quotations')}
              className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer bg-white border border-slate-200 shadow-2xs"
              title="Quay lại danh sách"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Chi tiết báo giá</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => setCurrentRoute('quotation-create')}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" /> Sửa báo giá
            </button>
            <button
              onClick={() => {
                alert("Sao chép đơn báo giá này thành công!");
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" /> Sao chép đơn
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> In / Xuất PDF
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: The Physical Invoice Paper */}
          <div className="lg:col-span-8 bg-white border border-slate-300 rounded-none shadow-md p-8 sm:p-12 space-y-8 relative overflow-hidden min-h-[950px] flex flex-col justify-between">
            <div>
              {/* Paper Top Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base tracking-tight">BN Wedding & Event</h2>
                  <p className="text-slate-500 font-medium mt-0.5">Đông Anh, Hà Nội</p>
                  <p className="text-slate-500 font-medium">Hotline: 0901 234 567</p>
                </div>
                <div className="text-left sm:text-right font-medium">
                  <p className="text-slate-800"><span className="text-slate-400">Mã báo giá:</span> <strong className="text-slate-950">{activeQuotation.id}</strong></p>
                  <p className="text-slate-400 mt-0.5">Ngày tạo: <span className="text-slate-700 font-semibold">{formatDateString(activeQuotation.createdAt)}</span></p>
                </div>
              </div>

              {/* Bold separator line */}
              <div className="border-b-2 border-slate-800 my-5"></div>

              {/* Centered Document Title */}
              <div className="text-center my-6">
                <h3 className="text-2xl font-black tracking-widest text-slate-950">PHIẾU BÁO GIÁ</h3>
              </div>

              {/* Customer and Event Info Block with dotted underlines */}
              <div className="space-y-3 text-xs text-slate-800 mt-8">
                <div className="flex items-end gap-1.5">
                  <span className="text-slate-400 whitespace-nowrap">Tên khách hàng:</span>
                  <span className="font-bold text-slate-900 border-b border-dotted border-slate-300 flex-1 pb-0.5">{activeQuotation.customerName}</span>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-slate-400 whitespace-nowrap">Địa chỉ:</span>
                  <span className="font-semibold text-slate-800 border-b border-dotted border-slate-300 flex-1 pb-0.5">Cầu Giấy, Hà Nội</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-end gap-1.5">
                    <span className="text-slate-400 whitespace-nowrap">Loại sự kiện:</span>
                    <span className="font-semibold text-slate-800 border-b border-dotted border-slate-300 flex-1 pb-0.5">Lễ ăn hỏi</span>
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span className="text-slate-400 whitespace-nowrap">Ngày tổ chức:</span>
                    <span className="font-semibold text-slate-800 border-b border-dotted border-slate-300 flex-1 pb-0.5">15/06/2024</span>
                  </div>
                </div>
              </div>

              {/* Items Table with Thick Lines */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-t-2 border-b-2 border-slate-800 text-[11px] uppercase font-bold text-slate-900">
                      <th className="px-3 py-2 text-center w-12">STT</th>
                      <th className="px-3 py-2 text-left">Tên hạng mục</th>
                      <th className="px-3 py-2 text-center w-16">ĐVT</th>
                      <th className="px-3 py-2 text-center w-16">SL</th>
                      <th className="px-3 py-2 text-right w-28">Đơn giá</th>
                      <th className="px-3 py-2 text-right w-28">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                    {activeQuotation.items.map((item, index) => {
                      const itemTotal = item.price * item.quantity;
                      return (
                        <tr key={item.id || index} className="hover:bg-slate-50/20">
                          <td className="px-3 py-3 text-center text-slate-400 font-medium">{index + 1}</td>
                          <td className="px-3 py-3 font-semibold text-slate-950 leading-snug">{item.name}</td>
                          <td className="px-3 py-3 text-center text-slate-500 font-medium">{item.unit || 'bộ'}</td>
                          <td className="px-3 py-3 text-center font-bold text-slate-900">{item.quantity}</td>
                          <td className="px-3 py-3 text-right text-slate-600 font-semibold">{item.price.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-3 text-right font-extrabold text-slate-950">{itemTotal.toLocaleString('vi-VN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Price Calculations breakdown */}
              <div className="flex justify-end mt-6">
                <div className="w-72 space-y-2 text-xs text-slate-800 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng tiền hàng:</span>
                    <span className="font-bold text-slate-950">{activeQuotation.subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span className="text-slate-500">Giảm giá:</span>
                    <span className="font-bold">- {activeQuotation.discountTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="border-b-2 border-slate-800 my-1"></div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-1">
                    <span>Tổng cộng:</span>
                    <span className="text-base font-black">{activeQuotation.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom metadata, written total, and signatures block */}
            <div className="space-y-12 pt-8 border-t border-slate-100">
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-400">Số tiền bằng chữ:</span>{' '}
                  <span className="italic text-slate-800 font-bold">{formatNumberToWords(activeQuotation.totalAmount)}</span>
                </p>
                <p>
                  <span className="font-semibold text-slate-400">Ghi chú:</span>{' '}
                  <span className="italic text-slate-700 font-medium">
                    {activeQuotation.notes || 'Hiệu lực báo giá 7 ngày, bao gồm lắp đặt.'}
                  </span>
                </p>
              </div>

              {/* Signature section */}
              <div className="grid grid-cols-2 text-center pt-4">
                <div className="space-y-14">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">Khách hàng</p>
                  <p className="text-slate-400 text-[11px] italic">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="space-y-14">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">Người lập báo giá</p>
                  <p className="font-extrabold text-slate-800 text-xs">{activeQuotation.createdBy || 'Nguyễn Văn A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Widgets / Cards */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Trạng thái báo giá */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Trạng thái báo giá</h3>
              
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  activeQuotation.status === 'Approved' ? 'bg-[#DCFCE7] text-[#15803D]' :
                  activeQuotation.status === 'Rejected' ? 'bg-[#FEE2E2] text-[#B91C1C]' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {displayStatusVN(activeQuotation.status)}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Người tạo:</span>
                  <span className="text-slate-800 font-semibold">{activeQuotation.createdBy || 'Nguyễn Văn A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngày cập nhật:</span>
                  <span className="text-slate-800 font-semibold">{formatDateString(activeQuotation.createdAt)} 14:30</span>
                </div>
              </div>
            </div>

            {/* Card 2: Tóm tắt tài chính */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Tóm tắt tài chính</h3>
              
              <div className="space-y-2.5 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng tiền:</span>
                  <span className="text-slate-800 font-bold">{activeQuotation.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span className="text-slate-400">Giảm giá:</span>
                  <span className="font-bold">-{activeQuotation.discountTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-slate-500 font-bold text-xs">Thành tiền:</span>
                  <span className="text-lg font-black text-[#2563EB]">{activeQuotation.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Suggested deposit box */}
              <div className="bg-[#EFF6FF] text-[#1E40AF] p-3 rounded-lg text-xs font-bold flex justify-between items-center border border-blue-100 mt-2">
                <span>Cọc đề xuất (10%):</span>
                <span className="text-blue-700">{(activeQuotation.totalAmount * 0.1).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            {/* Card 3: Quick Action Buttons */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <button
                onClick={() => setCurrentRoute('quotation-create')}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Sửa báo giá
              </button>
              
              <button
                onClick={() => {
                  alert("Sao chép đơn báo giá này thành công!");
                }}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                Sao chép
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-400" />
                In báo giá
              </button>

              <button
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa báo giá này không?")) {
                    handleDeleteDraft(activeQuotation.id);
                  }
                }}
                className="w-full bg-white hover:bg-rose-50 text-red-600 border border-rose-200 font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Xóa báo giá
              </button>
            </div>

            {/* Card 4: Lịch sử xử lý */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Lịch sử xử lý</h3>
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-100">
                {/* Milestone 1 */}
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50"></div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs leading-none">Cập nhật nội dung</p>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{activeQuotation.createdBy || 'Nguyễn Văn A'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{formatDateString(activeQuotation.createdAt)} 14:30</p>
                  </div>
                </div>
                {/* Milestone 2 */}
                <div className="relative">
                  <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div>
                    <p className="font-bold text-slate-700 text-xs leading-none">Tạo báo giá</p>
                    <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{activeQuotation.createdBy || 'Nguyễn Văn A'}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{formatDateString(activeQuotation.createdAt)} 09:15</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 3. CREATE/EDIT SCREEN
  if (currentRoute === 'quotation-create') {
    const { subtotal, discountTotal, totalAmount } = calculateTotals();

    return (
      <div id="quotation-create-view" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {editMode ? `Sửa báo giá nháp ${selectedQuotationId}` : 'Khởi tạo báo giá mới'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Xây dựng phương án và thiết lập bảng giá dịch vụ tiệc cưới.</p>
          </div>
          <button
            onClick={() => setCurrentRoute('quotations')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-semibold text-sm bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl hover:shadow-sm transition-all cursor-pointer"
          >
            Huỷ bỏ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* General info & items creator */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">Thông tin chung</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn khách hàng liên kết <span className="text-red-500">*</span></label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      // Pre-link order if any exists
                      const matchedOrder = orders.find(o => o.customerId === e.target.value);
                      if (matchedOrder) setSelectedOrderId(matchedOrder.id);
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white font-medium"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn đơn hàng liên đới (nếu có)</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white font-medium"
                  >
                    <option value="">-- Chọn đơn hàng tương ứng --</option>
                    {orders
                      .filter(o => !selectedCustomerId || o.customerId === selectedCustomerId)
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.id} - {o.eventName}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <label className="font-semibold text-gray-700 block">Ghi chú kèm theo trên báo giá</label>
                <textarea
                  placeholder="Ghi chú về tiến độ, điều khoản thanh toán, hoa tươi..."
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                ></textarea>
              </div>
            </div>

            {/* Editable Item List */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <h3 className="font-bold text-gray-800">Hạng mục báo giá</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1.5 bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-bold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm item mới
                </button>
              </div>

              {quotationItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Chưa có sản phẩm nào được chọn. Nhấn "Thêm item mới" để thêm dịch vụ.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {quotationItems.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative group">
                      
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500">Hạng mục #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                          title="Xóa hạng mục"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Selector or input */}
                        <div className="md:col-span-5 space-y-1">
                          <label className="font-semibold text-gray-500 block">Tên sản phẩm / dịch vụ</label>
                          <select
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] font-bold text-gray-800"
                          >
                            {ITEM_CATALOG.map(cat => (
                              <option key={cat.name} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Category */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="font-semibold text-gray-500 block">Loại item</label>
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          />
                        </div>

                        {/* Unit */}
                        <div className="md:col-span-1.5 space-y-1">
                          <label className="font-semibold text-gray-500 block text-center">Đơn vị</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-center"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-1 space-y-1">
                          <label className="font-semibold text-gray-500 block text-center">SL</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-center font-semibold"
                          />
                        </div>

                        {/* Price */}
                        <div className="md:col-span-1.5 space-y-1">
                          <label className="font-semibold text-gray-500 block text-right">Đơn giá (đ)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-right font-semibold"
                          />
                        </div>

                        {/* Discount */}
                        <div className="md:col-span-1 space-y-1">
                          <label className="font-semibold text-gray-500 block text-right">Giảm (đ)</label>
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-right text-rose-500"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5 sticky top-24 text-slate-700">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-50 pb-2.5 text-base flex items-center justify-between">
                <span>Tổng hợp báo giá</span>
                <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                  {editMode ? 'CẬP NHẬT' : 'TẠO MỚI'}
                </span>
              </h3>
              
              {/* Optional fee additions */}
              <div className="space-y-2 pb-1.5 border-b border-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tuỳ chọn phụ phí</span>
                
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Thuế VAT (8%)</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Cộng thêm 8% vào tổng thanh toán</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={includeServiceCharge}
                    onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                    className="rounded border-slate-300 text-[#2563EB] focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">Phí phục vụ (5%)</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Cộng phí quản lý và phục vụ 5%</p>
                  </div>
                </label>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính (chưa giảm):</span>
                  <span className="font-bold text-slate-900">{calculateTotals().subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Giảm giá hạng mục:</span>
                  <span className="font-bold">-{calculateTotals().discountTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {includeVat && (
                  <div className="flex justify-between text-slate-600 animate-fade-in">
                    <span>Thuế GTGT (VAT 8%):</span>
                    <span className="font-bold text-slate-900">+{calculateTotals().vatAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {includeServiceCharge && (
                  <div className="flex justify-between text-slate-600 animate-fade-in">
                    <span>Phí phục vụ (5%):</span>
                    <span className="font-bold text-slate-900">+{calculateTotals().serviceChargeAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                  <span className="text-slate-800 font-black text-sm">Tổng tiền cuối:</span>
                  <span className="text-xl font-black text-[#2563EB] tracking-tight">
                    {calculateTotals().totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('Draft')}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-colors cursor-pointer"
                >
                  Lưu bản nháp (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuotation('Approved')}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs shadow-blue-100 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận & Duyệt báo giá
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
