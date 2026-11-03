import type { AdminUserRole, AdminUserStatus, TranslationKey } from '@/types';

export const USER_ROLES: AdminUserRole[] = ['traveller', 'business_owner', 'admin'];
export const USER_STATUSES: AdminUserStatus[] = ['active', 'suspended'];

export const ROLE_STYLE: Record<AdminUserRole, { labelKey: TranslationKey; className: string }> = {
  traveller: {
    labelKey: 'userAdmin.role.traveller',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  business_owner: {
    labelKey: 'userAdmin.role.business_owner',
    className: 'bg-primary-fixed text-on-primary-fixed',
  },
  admin: {
    labelKey: 'userAdmin.role.admin',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
};

export const STATUS_STYLE: Record<
  AdminUserStatus,
  { labelKey: TranslationKey; className: string }
> = {
  active: {
    labelKey: 'userAdmin.status.active',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  suspended: {
    labelKey: 'userAdmin.status.suspended',
    className: 'bg-error-container text-on-error-container',
  },
};

/** Mã hiển thị, ví dụ US-0007 */
export const userCode = (id: string): string => `US-${id.padStart(4, '0')}`;

/** Chữ cái đầu cho ảnh đại diện mặc định */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
