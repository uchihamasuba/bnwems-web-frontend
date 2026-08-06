import type { BadgeVariant } from '@/components/ui/Badge';

// Trang /admin/settings/users (mục sidebar "Nhân viên") hiện code THUẦN GIAO DIỆN theo mục 0
// CLAUDE.md, port từ docs/components/EmployeesView.tsx — theo quyết định rõ ràng của người dùng,
// TRANG NÀY THAY THẾ trang quản lý tài khoản/RBAC thật đã build trước đó (userApiService, 4 role
// ADMIN/MANAGER/LEADER/TECHNICAL — xem src/types/user.ts, src/services/user.service.ts, và các
// modal UserFormModal/ResetPasswordModal/UserDetailModal vẫn còn trong repo nhưng không còn được
// trang này sử dụng). Khái niệm "nhân sự" ở đây là nhân sự vận hành sự kiện (Quản lý/Điều phối
// viên/Kỹ thuật/Bếp trưởng/MC/Trang trí), khác hẳn RBAC — hoàn toàn mock, không nối API thật.

export type EmployeeRole = 'Quản lý' | 'Điều phối viên' | 'Kỹ thuật' | 'Bếp trưởng' | 'MC/MC Lead' | 'Trang trí';
export type EmployeeStatus = 'active' | 'inactive';

export const EMPLOYEE_ROLES: EmployeeRole[] = ['Quản lý', 'Điều phối viên', 'Kỹ thuật', 'Bếp trưởng', 'MC/MC Lead', 'Trang trí'];

export const EMPLOYEE_ROLE_BADGE: Record<EmployeeRole, BadgeVariant> = {
  'Quản lý': 'info',
  'Điều phối viên': 'success',
  'Kỹ thuật': 'warning',
  'Bếp trưởng': 'error',
  'MC/MC Lead': 'info',
  'Trang trí': 'neutral',
};

export const EMPLOYEE_STATUS_META: Record<EmployeeStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: 'Đang trực', variant: 'success' },
  inactive: { label: 'Ngoại tuyến', variant: 'neutral' },
};

export interface AdminEmployee {
  id: string; // NV001
  name: string;
  phone: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  avatarColor: string;
  assignedBookings: number;
}

const NAME_POOL = [
  'Vũ Hoàng Long', 'Lê Minh Dũng', 'Nguyễn Thị Hương', 'Trần Anh Tuấn', 'Phạm Thị Mai',
  'Bùi Thanh Hương', 'Trần Đức Anh', 'Mai Thị Hạnh', 'Đỗ Quốc Việt', 'Ngô Thị Lan',
  'Hoàng Văn Kiên', 'Đặng Thị Thu', 'Lâm Quốc Bảo', 'Tô Thị Ngọc', 'Dương Văn Phát',
];

const AVATAR_COLOR_POOL = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-slate-600'];

function slugifyEmail(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
    .split(/\s+/);
  const last = normalized[normalized.length - 1] ?? 'nv';
  const initials = normalized.slice(0, -1).map((p) => p[0]).join('');
  return `${last}.${initials}@bnwems.vn`;
}

function generateMockEmployees(): AdminEmployee[] {
  return Array.from({ length: 22 }, (_, i) => {
    const name = NAME_POOL[i % NAME_POOL.length];
    return {
      id: `NV${String(i + 1).padStart(3, '0')}`,
      name: i >= NAME_POOL.length ? `${name} ${Math.floor(i / NAME_POOL.length) + 1}` : name,
      phone: `09${String(20_000_000 + i * 191).slice(0, 8)}`,
      email: slugifyEmail(name),
      role: EMPLOYEE_ROLES[i % EMPLOYEE_ROLES.length],
      status: i % 5 === 0 ? 'inactive' : 'active',
      avatarColor: AVATAR_COLOR_POOL[i % AVATAR_COLOR_POOL.length],
      assignedBookings: i % 8,
    };
  });
}

let store: AdminEmployee[] = generateMockEmployees();

export function getAdminEmployees(): AdminEmployee[] {
  return store;
}

export function addAdminEmployee(employee: AdminEmployee): void {
  store = [employee, ...store];
}

export function updateAdminEmployee(id: string, patch: Partial<AdminEmployee>): void {
  store = store.map((e) => (e.id === id ? { ...e, ...patch } : e));
}

export function deleteAdminEmployee(id: string): void {
  store = store.filter((e) => e.id !== id);
}

export function nextAdminEmployeeId(): string {
  const maxNum = store.reduce((max, e) => {
    const num = Number(e.id.replace(/\D/g, ''));
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `NV${String(maxNum + 1).padStart(3, '0')}`;
}
