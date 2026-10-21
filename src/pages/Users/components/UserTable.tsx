import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon, SortableHeader } from '@/components/common';
import type { UserSortKey } from '@/pages/Users/userUtils';
import type { AppUser, TranslationKey } from '@/types';
import type { SortState } from '@/utils/sort';
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

const COLUMNS: { labelKey: TranslationKey; sortKey?: UserSortKey }[] = [
  { labelKey: 'table.users.user', sortKey: 'name' },
  { labelKey: 'table.users.email', sortKey: 'email' },
  { labelKey: 'table.users.phone' },
  { labelKey: 'table.users.joinedAt', sortKey: 'joinedAt' },
  { labelKey: 'table.users.savedTrips', sortKey: 'tripCount' },
  { labelKey: 'table.users.status', sortKey: 'status' },
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
  const { t } = useTranslation();
  const selectedOnPage = users.filter((user) => selectedIds.has(user.id)).length;
  const allSelected = users.length > 0 && selectedOnPage === users.length;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 px-space-lg py-2.5">
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md font-semibold text-primary">
              {t('users.userTable.usersSelected', { count: selectedIds.size })}
            </span>
            <button type="button" onClick={onBulkLock} className={BULK_BUTTON_CLASS}>
              {t('users.userTable.lockSelected')}
            </button>
            <button type="button" onClick={onBulkUnlock} className={BULK_BUTTON_CLASS}>
              {t('users.userTable.unlockSelected')}
            </button>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            title={t('users.userTable.clearSelection')}
            className="text-on-surface-variant hover:text-error"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      <div className="table-scroll overflow-x-auto">
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
                  aria-label={t('table.selectAllOnPage')}
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) =>
                column.sortKey ? (
                  <SortableHeader
                    key={column.labelKey}
                    label={t(column.labelKey)}
                    sortKey={column.sortKey}
                    sort={sort}
                    onSort={onSort}
                    className="px-space-md py-3.5"
                  />
                ) : (
                  <th key={column.labelKey} className="px-space-md py-3.5">
                    {t(column.labelKey)}
                  </th>
                ),
              )}
              <th className="py-3.5 pr-space-lg pl-space-md text-right">
                {t('table.users.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface">
            {users.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="person_search" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('users.userTable.noMatchingUsersFound')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('users.userTable.tryDifferentKeywordOr')}
                    </span>
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
