import i18n from 'i18next';
import type {
  ListingSlaHours,
  PermissionLevel,
  PermissionRow,
  SelectOption,
  SessionTimeoutMinutes,
  SettingsTab,
  SystemSettings,
  SystemTimezone,
} from '@/types';

export const SETTINGS_TABS: { id: SettingsTab; label: string; icon: string }[] = [
  {
    id: 'general',
    get label() {
      return i18n.t('settings.constants.generalSettings');
    },
    icon: 'tune',
  },
  {
    id: 'listing',
    get label() {
      return i18n.t('settings.constants.listingReviewRules');
    },
    icon: 'verified',
  },
  {
    id: 'security',
    get label() {
      return i18n.t('settings.constants.securityAdminPermissions');
    },
    icon: 'security',
  },
  {
    id: 'notifications',
    get label() {
      return i18n.t('settings.constants.notificationsAlertEmails');
    },
    icon: 'notifications_active',
  },
];

export const TIMEZONE_OPTIONS: SelectOption<SystemTimezone>[] = [
  {
    value: 'gmt+7',
    get label() {
      return i18n.t('settings.constants.gmt700Hanoi');
    },
  },
  {
    value: 'gmt+8',
    get label() {
      return i18n.t('settings.constants.gmt800Singapore');
    },
  },
  { value: 'utc', label: 'GMT+0:00 (UTC)' },
];

export const LISTING_SLA_OPTIONS: ListingSlaHours[] = [24, 48, 72];
export const SESSION_TIMEOUT_OPTIONS: SessionTimeoutMinutes[] = [15, 30, 60];
/** Giá trị khuyến nghị — dùng cho nút "Khôi phục mặc định" */
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'Smart Travel Vietnam Core',
  timezone: 'gmt+7',
  englishFallback: true,
  listingSlaHours: 24,
  requireLegalDocs: true,
  gpsDuplicateCheck: true,
  autoEmailPartnerResult: true,
  twoFactorRequired: true,
  sessionTimeoutMinutes: 15,
};

/** Thông số hạ tầng hiển thị (chỉ đọc) */
export const PLATFORM_INFO = {
  releaseCode: 'v3.8.4 Enterprise LTS',
  get productionBadge() {
    return i18n.t('settings.constants.productionBuildV38');
  },
  dataCenter: 'Ho Chi Minh City Data Center (Zone VN-South-1)',
  storageUsedGb: 682,
  storageTotalGb: 1024,
  hardwareKey: 'YubiKey',
};

export const PERMISSION_LEVEL_CONFIG: Record<
  PermissionLevel,
  { label: string; icon: string; className: string }
> = {
  full: {
    get label() {
      return i18n.t('settings.constants.fullAccess');
    },
    icon: 'verified_user',
    className: 'bg-primary/10 text-primary',
  },
  edit: {
    get label() {
      return i18n.t('settings.constants.viewProcess');
    },
    icon: 'edit',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  view: {
    get label() {
      return i18n.t('settings.constants.viewOnly');
    },
    icon: 'visibility',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  none: {
    get label() {
      return i18n.t('settings.constants.noAccess');
    },
    icon: 'block',
    className: 'bg-error-container/60 text-error',
  },
};

export const PERMISSION_ROLES: {
  key: Exclude<keyof PermissionRow, 'module' | 'icon'>;
  label: string;
}[] = [
  { key: 'superAdmin', label: 'Super Admin' },
  {
    key: 'moderator',
    get label() {
      return i18n.t('settings.constants.moderator');
    },
  },
  {
    key: 'support',
    get label() {
      return i18n.t('settings.constants.support');
    },
  },
];

export const PERMISSION_MATRIX: PermissionRow[] = [
  {
    get module() {
      return i18n.t('settings.constants.dashboard');
    },
    icon: 'dashboard',
    superAdmin: 'full',
    moderator: 'view',
    support: 'view',
  },
  {
    get module() {
      return i18n.t('settings.constants.userManagement');
    },
    icon: 'group',
    superAdmin: 'full',
    moderator: 'view',
    support: 'edit',
  },
  {
    get module() {
      return i18n.t('settings.constants.partnerManagement');
    },
    icon: 'business_center',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'view',
  },
  {
    get module() {
      return i18n.t('settings.constants.listingManagement');
    },
    icon: 'store_mall_directory',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'view',
  },
  {
    get module() {
      return i18n.t('settings.constants.poiDestinations');
    },
    icon: 'place',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'view',
  },
  {
    get module() {
      return i18n.t('settings.constants.reportsAnalytics');
    },
    icon: 'bar_chart',
    superAdmin: 'full',
    moderator: 'view',
    support: 'none',
  },
  {
    get module() {
      return i18n.t('settings.constants.notifications');
    },
    icon: 'notifications',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'edit',
  },
  {
    get module() {
      return i18n.t('settings.constants.systemSettings');
    },
    icon: 'settings',
    superAdmin: 'full',
    moderator: 'none',
    support: 'none',
  },
];
