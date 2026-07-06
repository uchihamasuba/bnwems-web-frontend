import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Trash2, 
  SlidersHorizontal, 
  AlertCircle, 
  CheckCircle, 
  Printer, 
  Send, 
  X, 
  ShoppingCart, 
  Calendar,
  Layers
} from 'lucide-react';
import { InventoryItem, PickList, Order, WorkTask, initialInventory } from '../mockData';

interface InventoryViewProps {
  orders: Order[];
  pickLists: PickList[];
  setPickLists: React.Dispatch<React.SetStateAction<PickList[]>>;
  tasks: WorkTask[];
  onNavigate: (route: string, menu: string) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

export default function InventoryView({
  orders,
  pickLists,
  setPickLists,
  tasks,
  onNavigate,
  inventory,
  setInventory,
}: InventoryViewProps) {
  
  // Tab selector: 'check' | 'picklists'
  const [activeSubTab, setActiveSubTab] = useState<'check' | 'picklists'>('check');

  // SUB TAB 1: Daily check States
  const [checkDate, setCheckDate] = useState('2026-07-15');
  const [checkItems, setCheckItems] = useState<{
    id: string;
    itemId: string;
    requestedQty: number;
  }[]>([
    { id: 'c-1', itemId: 'INV-001', requestedQty: 12 },
    { id: 'c-2', itemId: 'INV-003', requestedQty: 15 }
  ]);

  // SUB TAB 2: Pick list Creator States
  const [showPickModal, setShowPickModal] = useState(false);
  const [formPickOrderId, setFormPickOrderId] = useState('');
  const [formPickTaskId, setFormPickTaskId] = useState('');
  const [formPickPrepareDate, setFormPickPrepareDate] = useState('');
  const [formPickStaff, setFormPickStaff] = useState('Vũ Quốc Bảo (Logistics)');
  const [formPickNotes, setFormPickNotes] = useState('');
  const [formPickItems, setFormPickItems] = useState<{
    itemId: string;
    itemName: string;
    requestedQty: number;
    notes: string;
  }[]>([]);

  // 1. ADD ITEM TO AVAILABILITY CHECKER
  const handleAddCheckItem = () => {
    const newItem = {
      id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: inventory[0]?.id || '',
      requestedQty: 5
    };
    setCheckItems(prev => [...prev, newItem]);
  };

  // Change individual check item properties
  const handleCheckItemChange = (id: string, field: 'itemId' | 'requestedQty', value: any) => {
    setCheckItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  // Remove check item from checker table
  const handleRemoveCheckItem = (id: string) => {
    setCheckItems(prev => prev.filter(it => it.id !== id));
  };

  // 2. CREATE PICK LIST SUBMIT
  const handleCreatePickList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPickOrderId || formPickItems.length === 0) {
      alert("Vui lòng chọn đơn hàng và thêm vật tư.");
      return;
    }

    const linkedOrder = orders.find(o => o.id === formPickOrderId);
    const customerName = linkedOrder ? linkedOrder.customerName : 'Unknown';

    const newId = `PICK-${String(pickLists.length + 1).padStart(3, '0')}`;
    const newPick: PickList = {
      id: newId,
      orderId: formPickOrderId,
      customerName,
      taskTitle: formPickTaskId ? (tasks.find(t => t.id === formPickTaskId)?.title || 'Chuẩn bị') : 'Chuẩn bị thiết bị',
      itemCount: formPickItems.length,
      prepareDate: formPickPrepareDate || '2026-07-14',
      staffInCharge: formPickStaff,
      status: 'Pending',
      items: formPickItems.map(pItem => {
        const warehouseItem = inventory.find(i => i.id === pItem.itemId);
        return {
          itemId: pItem.itemId,
          itemName: pItem.itemName,
          unit: warehouseItem ? warehouseItem.unit : 'Cái',
          requestedQty: pItem.requestedQty,
          availableQty: warehouseItem ? warehouseItem.availableQty : 10,
          preparedQty: 0,
          notes: pItem.notes
        };
      })
    };

    setPickLists(prev => [newPick, ...prev]);
    setShowPickModal(false);
    alert(`Tạo phiếu xuất kho ${newId} thành công!`);
    setActiveSubTab('picklists');
  };

  // Pre-load items when creating pick list
  const handleOpenCreatePick = () => {
    setFormPickOrderId(orders[0]?.id || '');
    setFormPickPrepareDate('2026-07-14');
    setFormPickStaff('Vũ Quốc Bảo (Logistics)');
    setFormPickNotes('');
    
    // Default pre-fill items
    setFormPickItems([
      { itemId: 'INV-001', itemName: 'Đèn Moving Head Beam 230W', requestedQty: 12, notes: 'Kiểm tra bóng và cơ xoay' },
      { itemId: 'INV-004', itemName: 'Cổng vòm sắt bán nguyệt nghệ thuật', requestedQty: 1, notes: 'Khung cổng chính' }
    ]);
    setShowPickModal(true);
  };

  return (
    <div id="inventory-view" className="space-y-6">
      
      {/* Tab select header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('check')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'check' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            Kiểm tra tồn kho theo ngày
          </button>
          <button
            onClick={() => setActiveSubTab('picklists')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              activeSubTab === 'picklists' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            Quản lý phiếu xuất kho
          </button>
        </div>

        {activeSubTab === 'picklists' && (
          <button
            onClick={handleOpenCreatePick}
            className="flex items-center gap-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo phiếu xuất kho
          </button>
        )}
      </div>

      {/* SUB TAB 1: DAILY WAREHOUSE CHECKER */}
      {activeSubTab === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Main check form */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 border-b border-gray-50 pb-4 text-sm">
              <div className="space-y-1.5 flex-1">
                <label className="font-semibold text-gray-700 block">Chọn ngày diễn ra sự kiện cần kiểm tra</label>
                <input
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-bold text-[#2563EB]"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="font-semibold text-gray-700 block">Khu vực địa bàn lắp ráp</label>
                <input
                  type="text"
                  placeholder="Hà Nội, GEM Center..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Danh sách vật tư thiết bị cần tra cứu</h3>
              <button
                type="button"
                onClick={handleAddCheckItem}
                className="text-xs text-[#2563EB] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                + Thêm thiết bị cần check
              </button>
            </div>

            {/* Editable Checker table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-gray-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Thiết bị trong kho tổng</th>
                    <th className="px-4 py-3 text-center">Đơn vị</th>
                    <th className="px-4 py-3 text-center">Yêu cầu sử dụng</th>
                    <th className="px-4 py-3 text-center">Khả dụng ngày {checkDate}</th>
                    <th className="px-4 py-3 text-center">Trạng thái dự phòng</th>
                    <th className="px-4 py-3 text-right">Khấu hao thiếu</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {checkItems.map((item) => {
                    const matchedWarehouse = inventory.find(i => i.id === item.itemId);
                    const totalInWarehouse = matchedWarehouse ? matchedWarehouse.totalQty : 0;
                    const availableInWarehouse = matchedWarehouse ? matchedWarehouse.availableQty : 0;
                    
                    // Simulate calculations:
                    const isEnough = item.requestedQty <= availableInWarehouse;
                    const isReserved = !isEnough && item.requestedQty <= totalInWarehouse;
                    const deficit = isEnough ? 0 : item.requestedQty - availableInWarehouse;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5">
                          <select
                            value={item.itemId}
                            onChange={(e) => handleCheckItemChange(item.id, 'itemId', e.target.value)}
                            className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-700"
                          >
                            {inventory.map(w => (
                              <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-400 text-xs">
                          {matchedWarehouse ? matchedWarehouse.unit : 'Cái'}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQty}
                            onChange={(e) => handleCheckItemChange(item.id, 'requestedQty', parseInt(e.target.value) || 1)}
                            className="w-16 px-1.5 py-0.5 border border-gray-200 rounded text-center text-xs font-bold"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-gray-500 text-xs">
                          {availableInWarehouse}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEnough ? 'bg-green-50 text-green-700 border border-green-200' :
                            isReserved ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {isEnough ? '✓ ĐỦ KHẢ DỤNG' : isReserved ? 'ĐÃ GIỮ CHỖ' : '⚠ THIẾU HỤT'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-xs text-rose-500">
                          {deficit > 0 ? `Thiếu ${deficit}` : '0'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleRemoveCheckItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Summary recommendations panel */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 sticky top-24">
              <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Khuyến nghị vận hành kho
              </h3>

              <div className="text-xs space-y-3 leading-relaxed">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                  <span className="font-bold text-blue-800">Tỉ lệ khả dụng:</span>
                  <p className="text-gray-600">Với các dự toán tháng 07, tỉ lệ cấp hàng của kho tổng đạt <strong>85%</strong>. Màn hình LED P3 và Hoa tươi cao cấp cần được chuẩn bị hợp đồng dịch vụ thuê ngoài.</p>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-3 text-gray-500">
                  <p><strong>Gợi ý NCC khuyên dùng:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 font-medium">
                    <li>Đà Lạt Hasfarm (Hoa tươi)</li>
                    <li>Đại Phát Event (Màn LED Cabin)</li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate('procurement-create', 'procurement')}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" /> Tạo đơn thuê/mua NCC khẩn cấp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: PICK LISTS LIST */}
      {activeSubTab === 'picklists' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold">
                  <th className="px-6 py-4">Mã Pick List</th>
                  <th className="px-6 py-4">Mã đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Công việc phụ thuộc</th>
                  <th className="px-6 py-4 text-center">Số lượng vật tư</th>
                  <th className="px-6 py-4">Ngày chuẩn bị xuất</th>
                  <th className="px-6 py-4">Người phụ trách</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">In & Gửi đi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {pickLists.map((pick) => (
                  <tr key={pick.id} className="hover:bg-slate-50/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2563EB]">{pick.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{pick.orderId}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{pick.customerName}</td>
                    <td className="px-6 py-4 truncate max-w-[150px] font-medium text-gray-500">{pick.taskTitle}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">{pick.itemCount}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">{pick.prepareDate}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{pick.staffInCharge}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        pick.status === 'Completed' || pick.status === 'Picked' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{pick.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            alert(`Đã gửi lệnh in cho phiếu xuất kho ${pick.id}!`);
                          }}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-[#2563EB] rounded transition-colors"
                          title="In phiếu xuất kho"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            alert(`Đã gửi file Picklist ${pick.id} cho nhân sự phụ trách qua Zalo/Email thành công!`);
                          }}
                          className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-green-600 rounded transition-colors"
                          title="Gửi cho Leader Staff"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PICK LIST MODAL */}
      {showPickModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 text-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-800 text-base">Tạo mới Phiếu xuất kho (Pick List)</h3>
              <button onClick={() => setShowPickModal(false)} className="p-1 hover:bg-gray-200 rounded text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreatePickList} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Chọn đơn hàng/sự kiện liên đới</label>
                  <select
                    value={formPickOrderId}
                    onChange={(e) => setFormPickOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.customerName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Ngày chuẩn bị bốc xếp</label>
                  <input
                    type="date"
                    value={formPickPrepareDate}
                    onChange={(e) => setFormPickPrepareDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Người bốc dỡ phụ trách</label>
                  <input
                    type="text"
                    value={formPickStaff}
                    onChange={(e) => setFormPickStaff(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700 block">Ghi chú vận chuyển</label>
                  <input
                    type="text"
                    placeholder="Xếp hàng gọn lên xe tải 1.25 tấn..."
                    value={formPickNotes}
                    onChange={(e) => setFormPickNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Items checklist */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-gray-800">Danh mục thiết bị yêu cầu đóng gói</h4>
                <div className="border border-gray-100 rounded-xl p-3.5 bg-gray-50 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-gray-400 border-b border-gray-200 pb-1.5">
                    <span>Vật tư kho tổng</span>
                    <span>SL xuất</span>
                  </div>
                  {formPickItems.map((pi, idx) => (
                    <div key={pi.itemId} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-800">{pi.itemName}</span>
                        <p className="text-gray-400 text-[10px] italic mt-0.5">{pi.notes}</p>
                      </div>
                      <input
                        type="number"
                        value={pi.requestedQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setFormPickItems(prev => prev.map((itm, i) => i === idx ? { ...itm, requestedQty: val } : itm));
                        }}
                        className="w-14 px-1 py-0.5 border border-gray-200 rounded text-center font-bold text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-5">
                <button
                  type="button"
                  onClick={() => setShowPickModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer"
                >Hủy bỏ</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >Lưu & Tạo phiếu</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
