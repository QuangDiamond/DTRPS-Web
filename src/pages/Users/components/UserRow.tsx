import Icon from '../../../components/common/Icon';
import { USER_STATUS_CONFIG } from '../../../constants/user';
import type { AppUser } from '../../../types/admin';
import { formatDate } from '../../../utils/format';

interface UserRowProps {
  user: AppUser;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetail: (user: AppUser) => void;
  onLock: (user: AppUser) => void;
  onUnlock: (user: AppUser) => void;
}

export default function UserRow({
  user,
  selected,
  onToggleSelect,
  onViewDetail,
  onLock,
  onUnlock,
}: UserRowProps) {
  const suspended = user.status === 'suspended';
  const vip = user.accountType === 'vip';
  const status = USER_STATUS_CONFIG[user.status];

  const avatarClass = suspended
    ? 'bg-error-container text-error'
    : vip
      ? 'bg-tertiary-fixed text-tertiary'
      : user.avatarTone === 'teal'
        ? 'bg-secondary-container/40 text-primary'
        : 'bg-surface-container-high text-on-surface-variant';

  return (
    <tr
      className={`group transition-colors hover:bg-surface-container-low/60 ${
        suspended ? 'bg-error-container/10' : ''
      } ${selected ? 'bg-primary/5' : ''}`}
    >
      <td className="py-4 pr-space-xs pl-space-lg text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(user.id)}
          aria-label={`Chọn ${user.name}`}
          className="h-4 w-4 cursor-pointer rounded accent-primary"
        />
      </td>

      {/* Người dùng */}
      <td className="px-space-md py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${avatarClass}`}
          >
            <Icon
              name={suspended ? 'person_off' : 'person'}
              filled={vip && !suspended}
              className="text-[22px]"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onViewDetail(user)}
                className={`text-left font-title-md text-title-md font-semibold text-on-surface transition-colors ${
                  suspended ? 'group-hover:text-error' : 'group-hover:text-primary'
                }`}
              >
                {user.name}
              </button>
              {vip && (
                <span className="rounded bg-tertiary-fixed px-1.5 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
                  VIP
                </span>
              )}
              {user.accountType === 'partner' && (
                <span className="rounded bg-primary-fixed px-1.5 font-label-sm text-label-sm font-bold text-on-primary-fixed-variant">
                  Đối tác
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`rounded px-1.5 font-label-sm text-label-sm font-semibold ${
                  suspended
                    ? 'bg-error-container text-error'
                    : 'bg-secondary-container/50 text-primary'
                }`}
              >
                {user.id}
              </span>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span className="font-label-sm text-label-sm text-outline">{user.city}</span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-space-md py-4 font-medium text-on-surface-variant">{user.email}</td>
      <td className="px-space-md py-4 font-mono text-body-sm text-on-surface-variant">
        {user.phone}
      </td>
      <td className="px-space-md py-4 text-body-sm text-on-surface-variant">
        {formatDate(user.joinedAt)}
      </td>

      {/* Chuyến đi */}
      <td className="px-space-md py-4">
        <div className="flex flex-col">
          <span
            className={`text-body-sm font-semibold ${suspended ? 'text-outline' : 'text-on-surface'}`}
          >
            {user.tripCount} chuyến đi
          </span>
          {suspended ? (
            <span className="font-label-sm text-label-sm text-error">{user.suspendReason}</span>
          ) : (
            <span
              className={`flex items-center gap-1 font-label-sm text-label-sm ${
                vip
                  ? 'font-semibold text-tertiary'
                  : user.tripNoteIcon
                    ? 'text-primary'
                    : 'text-outline'
              }`}
            >
              {user.tripNoteIcon && <Icon name={user.tripNoteIcon} className="text-[13px]" />}
              {user.tripNote}
            </span>
          )}
        </div>
      </td>

      <td className="px-space-md py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${status.badgeClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </td>

      <td className="py-4 pr-space-lg pl-space-md text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onViewDetail(user)}
            className="rounded-lg bg-surface-container-low px-2.5 py-1 font-label-sm text-label-sm font-semibold text-primary transition-colors hover:bg-surface-container"
          >
            Chi tiết
          </button>
          {suspended ? (
            <button
              type="button"
              onClick={() => onUnlock(user)}
              className="flex items-center gap-1 rounded-lg bg-primary-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary-container transition-colors hover:opacity-90"
            >
              <Icon name="lock_open" className="text-[15px]" />
              Mở khóa
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onLock(user)}
              title="Khóa tài khoản"
              className="rounded-lg p-1.5 text-outline transition-colors hover:bg-error-container/40 hover:text-error"
            >
              <Icon name="lock" className="text-[18px]" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
