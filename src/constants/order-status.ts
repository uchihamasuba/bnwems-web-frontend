// Nhãn hiển thị cho trạng thái Order — đúng theo enum trong docs/api/09-orders.md:
// DRAFT → QUOTED → CONFIRMED → IN_PROGRESS → COMPLETED
export const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Nháp',
  QUOTED: 'Đã báo giá',
  CONFIRMED: 'Đã xác nhận',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
};
