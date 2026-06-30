// UC 2.15 (docs/api/10-survey-assignment.md)
//
// Backend thật chỉ có POST /tasks/:id/assignments (ghi phân công) — KHÔNG có GET nào để đọc lại
// danh sách phân công, không lưu field-status theo từng staff tại hiện trường. Các type đọc dưới
// đây (OrderAssignments/AssignmentGroup/AssignmentMember) hiện được phục vụ bởi mock route
// (MOCK-ONLY). Xem docs/more-require.md mục (n)(p).

// Trạng thái của từng nhân sự tại hiện trường (ngoài status cấp task của WorkTask).
export type FieldStatus = 'pending' | 'ready' | 'in_setup' | 'completed';

export interface AssignmentMember {
  userId: string;
  fullName: string;
  assignedRole: string; // nhãn vai trò hiển thị, vd 'Trưởng nhóm', 'Kỹ thuật âm thanh', 'Khảo sát viên'
  fieldStatus?: FieldStatus; // MOCK-ONLY (xem more-require.md mục p)
}

export interface AssignmentGroup {
  taskId: string;
  scheduledStart: string;
  scheduledEnd: string;
  shiftLabel?: string; // vd 'Ca sáng (06:00 - 12:00)'
  members: AssignmentMember[];
}

// GET /api/v1/orders/:id/assignments (MOCK-ONLY)
export interface OrderAssignments {
  survey: AssignmentGroup | null;
  execution: AssignmentGroup | null;
}

// POST /api/v1/tasks/:id/assignments (khớp doc)
export interface AssignStaffPayload {
  assignments: { userId: string; assignedRole: string }[];
}
