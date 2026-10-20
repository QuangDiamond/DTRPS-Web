import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { ADMIN_ROOT_CRUMB } from '../../constants/navigation';
import { PAGE_SIZE_OPTIONS } from '../../constants/partner';
import { userDetailPath } from '../../constants/routes';
import {
  DEFAULT_USER_FILTERS,
  USER_ACCOUNT_TYPE_LABELS,
  USER_STATUS_CONFIG,
} from '../../constants/user';
import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import type { AppUser, UserFilters, UserFormValues } from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDate, todayIsoDate } from '../../utils/format';
import LockUserModal from './components/LockUserModal';
import UserFilterBar from './components/UserFilterBar';
import UserFormModal from './components/UserFormModal';
import UserStatsCards from './components/UserStatsCards';
import UserTable from './components/UserTable';
import { filterUsers } from './userUtils';

type FormState = { mode: 'add' } | { mode: 'edit'; user: AppUser } | null;

/** Màn Quản lý người dùng (khách du lịch): /admin/users */
export default function UsersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { users, stats, createUser, updateUser, lockUsers, unlockUsers } = useUsers();

  // draftFilters: đang nhập; appliedFilters: áp dụng khi bấm nút lọc / Enter
  const [draftFilters, setDraftFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(DEFAULT_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lockTargets, setLockTargets] = useState<AppUser[] | null>(null);
  const [form, setForm] = useState<FormState>(null);

  const filtered = useMemo(() => filterUsers(users, appliedFilters), [users, appliedFilters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedUsers = users.filter((user) => selectedIds.has(user.id));

  // ===== Bộ lọc & chọn =====
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_USER_FILTERS);
    setAppliedFilters(DEFAULT_USER_FILTERS);
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      pageUsers.forEach((user) => (checked ? next.add(user.id) : next.delete(user.id)));
      return next;
    });
  };

  // ===== Khóa / mở khóa =====
  const openLock = (targets: AppUser[]) => {
    const active = targets.filter((user) => user.status === 'active');
    if (active.length === 0) {
      showToast('Các tài khoản đã chọn đều đang bị khóa', 'info');
      return;
    }
    setLockTargets(active);
  };

  const confirmLock = (reason: string) => {
    if (!lockTargets) return;
    const count = lockUsers(
      lockTargets.map((user) => user.id),
      reason,
    );
    showToast(
      count === 1 ? `Đã khóa tài khoản ${lockTargets[0].name}` : `Đã khóa ${count} tài khoản`,
      'error',
    );
    setLockTargets(null);
    setSelectedIds(new Set());
  };

  const unlock = (targets: AppUser[]) => {
    const count = unlockUsers(targets.map((user) => user.id));
    if (count === 0) {
      showToast('Các tài khoản đã chọn đều đang hoạt động', 'info');
      return;
    }
    showToast(count === 1 ? `Đã mở khóa ${targets[0].name}` : `Đã mở khóa ${count} tài khoản`);
    setSelectedIds(new Set());
  };

  // ===== Thêm / sửa / khác =====
  const submitForm = (values: UserFormValues) => {
    if (form?.mode === 'edit') {
      updateUser(form.user.id, values);
      showToast(`Đã cập nhật thông tin ${values.name}`);
    } else {
      const created = createUser(values);
      showToast(`Đã thêm người dùng ${created.name} (${created.id})`);
      resetFilters();
    }
    setForm(null);
  };

  const handleExport = () => {
    downloadCsv(
      `nguoi-dung-${todayIsoDate()}.csv`,
      [
        'UID',
        'Họ tên',
        'Email',
        'Số điện thoại',
        'Thành phố',
        'Ngày đăng ký',
        'Loại tài khoản',
        'Số chuyến đi',
        'Trạng thái',
        'Lý do khóa',
      ],
      filtered.map((user) => [
        user.id,
        user.name,
        user.email,
        user.phone,
        user.city,
        formatDate(user.joinedAt),
        USER_ACCOUNT_TYPE_LABELS[user.accountType],
        user.tripCount,
        USER_STATUS_CONFIG[user.status].label,
        user.suspendReason ?? '',
      ]),
    );
    showToast(`Đã xuất ${filtered.length} người dùng ra file Excel (CSV)`);
  };

  return (
    <div className="flex flex-col gap-space-lg pb-12">
      <PageHeader
        breadcrumbs={[ADMIN_ROOT_CRUMB, { label: 'Quản lý người dùng', icon: 'group' }]}
        title="Quản lý Khách du lịch"
        titleBadge={
          <span className="rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-container">
            Live Database
          </span>
        }
        description="Giám sát, phân quyền và hỗ trợ tài khoản thành viên trên toàn bộ nền tảng Smart Travel."
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest px-space-md py-2.5 font-label-md text-label-md font-semibold text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high"
            >
              <Icon name="download" className="text-[19px] text-primary" />
              <span>Xuất dữ liệu Excel/CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ mode: 'add' })}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:opacity-95"
            >
              <Icon name="person_add" className="text-[20px]" />
              <span>Thêm người dùng mới</span>
            </button>
          </>
        }
      />

      <UserStatsCards stats={stats} />

      <UserFilterBar
        filters={draftFilters}
        onChange={(changes) => setDraftFilters((current) => ({ ...current, ...changes }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <UserTable
        users={pageUsers}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkLock={() => openLock(selectedUsers)}
        onBulkUnlock={() => unlock(selectedUsers)}
        onViewDetail={(user) => navigate(userDetailPath(user.id))}
        onLock={(user) => openLock([user])}
        onUnlock={(user) => unlock([user])}
        footer={
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalItems={filtered.length}
            itemLabel="người dùng"
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {lockTargets && (
        <LockUserModal
          targets={lockTargets}
          onConfirm={confirmLock}
          onClose={() => setLockTargets(null)}
        />
      )}

      {form && (
        <UserFormModal
          key={form.mode === 'edit' ? form.user.id : 'new'}
          user={form.mode === 'edit' ? form.user : null}
          onSubmit={submitForm}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
