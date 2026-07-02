// Nhãn hiển thị cho trạng thái Order — đúng theo enum lowercase trong docs/api/09-orders.md:
// draft → confirmed → deposit_paid → in_progress → settlement_pending → completed | cancelled
export const ORDER_STATUS_LABEL: Record<string, string> = {
  draft: 'Nháp',
  confirmed: 'Đã xác nhận',
  deposit_paid: 'Đã đặt cọc',
  in_progress: 'Đang thực hiện',
  settlement_pending: 'Chờ quyết toán',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};
