import { useTranslation } from 'react-i18next';
import { ROLE_STYLE, STATUS_STYLE, initials } from '@/pages/UserAdmin/userAdminUtils';
import type { AdminUser, AdminUserRole, AdminUserStatus } from '@/types';

const BADGE_CLASS =
  'inline-flex items-center rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap';

export function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];
  return <span className={`${BADGE_CLASS} ${style.className}`}>{t(style.labelKey)}</span>;
}

export function UserRoleBadges({ roles }: { roles: AdminUserRole[] }) {
  const { t } = useTranslation();
  return (
    <span className="flex flex-wrap gap-1.5">
      {roles.map((role) => (
        <span key={role} className={`${BADGE_CLASS} ${ROLE_STYLE[role].className}`}>
          {t(ROLE_STYLE[role].labelKey)}
        </span>
      ))}
    </span>
  );
}

export function UserAvatar({ user, size = 'md' }: { user: AdminUser; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-16 w-16 text-[22px]' : 'h-10 w-10 text-[14px]';
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${box} shrink-0 rounded-full object-cover`} />
  ) : (
    <span
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-primary-fixed font-semibold text-on-primary-fixed`}
    >
      {initials(user.name)}
    </span>
  );
}
