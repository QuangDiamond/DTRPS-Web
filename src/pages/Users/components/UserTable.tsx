import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import SortableHeader from '../../../components/common/SortableHeader';
import type { AppUser } from '../../../types/admin';
import type { SortState } from '../../../utils/sort';
import type { UserSortKey } from '../userUtils';
import UserRow from './UserRow';

interface UserTableProps {
  users: AppUser[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onBulkLock: () => void;
  onBulkUnlock: () => void;
  onViewDetail: (user: AppUser) => void;
  onLock: (user: AppUser) => void;
  onUnlock: (user: AppUser) => void;
  sort: SortState<UserSortKey> | null;
  onSort: (key: UserSortKey) => void;
  footer: ReactNode;
}

const COLUMNS: { label: string; sortKey?: UserSortKey }[] = [
  { label: 'Người dùng', sortKey: 'name' },
  { label: 'Email', sortKey: 'email' },
  { label: 'Số điện thoại' },
  { label: 'Ngày đăng ký', sortKey: 'joinedAt' },
  { label: 'Chuyến đi đã lưu', sortKey: 'tripCount' },
  { label: 'Trạng thái tài khoản', sortKey: 'status' },
];

const BULK_BUTTON_CLASS =
  'rounded-lg bg-surface-container-lowest px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm hover:bg-surface-container';

export default function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onBulkLock,
  onBulkUnlock,
  onViewDetail,
  onLock,
  onUnlock,
  sort,
  onSort,
  footer,
}: UserTableProps) {
  const selectedOnPage = users.filter((user) => selectedIds.has(user.id)).length;
  const allSelected = users.length > 0 && selectedOnPage === users.length;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 px-space-lg py-2.5">
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md font-semibold text-primary">
              {selectedIds.size} người dùng đã chọn
            </span>
            <button type="button" onClick={onBulkLock} className={BULK_BUTTON_CLASS}>
              Khóa đồng loạt
            </button>
            <button type="button" onClick={onBulkUnlock} className={BULK_BUTTON_CLASS}>
              Mở khóa đồng loạt
            </button>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            title="Bỏ chọn"
            className="text-on-surface-variant hover:text-error"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low font-label-md text-label-md tracking-wider text-on-surface-variant uppercase">
              <th className="w-12 py-3.5 pr-space-xs pl-space-lg text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = selectedOnPage > 0 && !allSelected;
                  }}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label="Chọn tất cả trên trang"
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) =>
                column.sortKey ? (
                  <SortableHeader
                    key={column.label}
                    label={column.label}
                    sortKey={column.sortKey}
                    sort={sort}
                    onSort={onSort}
                    className="px-space-md py-3.5"
                  />
                ) : (
                  <th key={column.label} className="px-space-md py-3.5">
                    {column.label}
                  </th>
                ),
              )}
              <th className="py-3.5 pr-space-lg pl-space-md text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface">
            {users.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="person_search" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      Không tìm thấy người dùng phù hợp
                    </span>
                    <span className="font-body-sm text-body-sm">Thử đổi từ khóa hoặc bộ lọc.</span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedIds.has(user.id)}
                  onToggleSelect={onToggleSelect}
                  onViewDetail={onViewDetail}
                  onLock={onLock}
                  onUnlock={onUnlock}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}
