'use client';

import { useEffect, useState } from 'react';
import { Search, Eye, Pencil, KeyRound, Ban, CheckCircle2, Plus } from 'lucide-react';
import { userApiService } from '@/services/user.service';
import { Table, TableColumn } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { UserFormModal, UserFormValues } from '@/components/users/UserFormModal';
import { ResetPasswordModal } from '@/components/users/ResetPasswordModal';
import { UserDetailModal } from '@/components/users/UserDetailModal';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/formatDate';
import { ROLE_OPTIONS } from '@/constants/roles';
import type { AdminUser } from '@/types/user';

const STATUS_LABEL: Record<string, string> = {
  active: 'Đang hoạt động',
  inactive: 'Đã vô hiệu hóa',
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã vô hiệu hóa' },
];

export default function Page() {
  const { can } = usePermission();
  const canManage = can('master-data:manage');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { pagination, setPage, updatePagination } = usePagination(10);

  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; user: AdminUser | null } | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');

  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');

  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const refetchUsers = () => setRefreshToken((t) => t + 1);

  // Không còn endpoint GET /roles để tra roleId theo vai trò — suy ra map roleName -> roleId từ
  // chính danh sách user đã có (mỗi user trả về role: {roleId, roleName}). Nếu hệ thống chưa có
  // user nào thuộc 1 vai trò nào đó, map sẽ thiếu entry cho vai trò đó và việc tạo/sửa user với
  // vai trò đó sẽ báo lỗi rõ ràng thay vì gửi roleId sai.
  const [roleIdByName, setRoleIdByName] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    userApiService.getUsers({ limit: 200 }).then((res) => {
      const map = new Map<string, string>();
      (res.data as AdminUser[]).forEach((u) => map.set(u.role.roleName, u.role.roleId));
      setRoleIdByName(map);
    });
  }, [refreshToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag toggled before/after the fetch below, not a render loop
    setIsLoading(true);
    userApiService
      .getUsers({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })
      .then((res) => {
        setUsers(res.data);
        updatePagination({ totalItems: res.meta.totalCount, totalPages: Math.max(1, Math.ceil(res.meta.totalCount / res.meta.limit)) });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.limit, debouncedSearch, roleFilter, statusFilter, refreshToken]);

  const handleCreateSubmit = async (values: UserFormValues) => {
    const roleId = roleIdByName.get(values.role);
    if (!roleId) {
      setFormError(`Chưa xác định được roleId cho vai trò "${values.role}" (hệ thống chưa có user nào thuộc vai trò này).`);
      return;
    }
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await userApiService.createUser({
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        roleId,
      });
      setFormModal(null);
      refetchUsers();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Tạo người dùng thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEditSubmit = async (values: UserFormValues, user: AdminUser) => {
    const roleId = roleIdByName.get(values.role);
    if (!roleId) {
      setFormError(`Chưa xác định được roleId cho vai trò "${values.role}" (hệ thống chưa có user nào thuộc vai trò này).`);
      return;
    }
    setIsSubmittingForm(true);
    setFormError('');
    try {
      await userApiService.updateUser(user.userId, { fullName: values.fullName, roleId });
      setFormModal(null);
      refetchUsers();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Cập nhật người dùng thất bại'));
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmMessage =
      nextStatus === 'inactive'
        ? `Vô hiệu hóa tài khoản "${user.fullName}"?`
        : `Kích hoạt lại tài khoản "${user.fullName}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await userApiService.updateUserStatus(user.userId, { status: nextStatus });
      refetchUsers();
    } catch (err) {
      window.alert(getErrorMessage(err, 'Cập nhật trạng thái thất bại'));
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!resetPasswordUser) return;
    setIsResettingPassword(true);
    setResetPasswordError('');
    try {
      await userApiService.resetPassword(resetPasswordUser.userId, { newPassword });
      setResetPasswordUser(null);
    } catch (err) {
      setResetPasswordError(getErrorMessage(err, 'Đặt lại mật khẩu thất bại'));
    } finally {
      setIsResettingPassword(false);
    }
  };

  const columns: TableColumn<AdminUser>[] = [
    {
      key: 'fullName',
      label: 'Họ và tên',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} />
          <div>
            <p className="font-medium text-slate-800">{row.fullName}</p>
            <p className="text-xs text-slate-400">{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (row) => <Badge variant="neutral">{row.role.roleName}</Badge>,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <Badge variant={getStatusBadgeVariant(row.status)}>{STATUS_LABEL[row.status] ?? row.status}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Xem chi tiết"
            title="Xem chi tiết"
            onClick={() => setDetailUser(row)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManage && (
            <>
              <button
                type="button"
                aria-label="Chỉnh sửa"
                title="Chỉnh sửa"
                onClick={() => setFormModal({ mode: 'edit', user: row })}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Đặt lại mật khẩu"
                title="Đặt lại mật khẩu"
                onClick={() => setResetPasswordUser(row)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
              >
                <KeyRound className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                title={row.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                onClick={() => handleToggleStatus(row)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                {row.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo, cập nhật và quản lý trạng thái tài khoản nhân sự.</p>
        </div>
        {canManage && (
          <Button onClick={() => setFormModal({ mode: 'create', user: null })}>
            <Plus className="h-4 w-4" />
            Tạo người dùng
          </Button>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Input
              placeholder="Tìm theo tên đăng nhập hoặc họ tên..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-48">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[{ value: '', label: 'Tất cả vai trò' }, ...ROLE_OPTIONS]}
            />
          </div>
          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Table columns={columns} rows={users} rowKey={(row) => row.userId} isLoading={isLoading} />
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      <UserFormModal
        isOpen={!!formModal}
        mode={formModal?.mode ?? 'create'}
        user={formModal?.user}
        isSubmitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          setFormModal(null);
          setFormError('');
        }}
        onSubmit={(values) => {
          if (formModal?.mode === 'edit' && formModal.user) {
            handleEditSubmit(values, formModal.user);
          } else {
            handleCreateSubmit(values);
          }
        }}
      />

      <ResetPasswordModal
        isOpen={!!resetPasswordUser}
        user={resetPasswordUser}
        isSubmitting={isResettingPassword}
        errorMessage={resetPasswordError}
        onClose={() => {
          setResetPasswordUser(null);
          setResetPasswordError('');
        }}
        onSubmit={handleResetPassword}
      />

      <UserDetailModal isOpen={!!detailUser} user={detailUser} onClose={() => setDetailUser(null)} />
    </div>
  );
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}
