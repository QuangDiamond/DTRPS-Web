import i18n from 'i18next';
import type {
  ListingSlaHours,
  MapSyncFrequency,
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
    id: 'ai',
    get label() {
      return i18n.t('settings.constants.aiPlannerPoiConfiguration');
    },
    icon: 'psychology',
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

export const MAP_SYNC_OPTIONS: SelectOption<MapSyncFrequency>[] = [
  {
    value: '1h',
    get label() {
      return i18n.t('settings.constants.everyHourHighFrequency');
    },
  },
  {
    value: '6h',
    get label() {
      return i18n.t('settings.constants.every6HoursRecommended');
    },
  },
  {
    value: '12h',
    get label() {
      return i18n.t('settings.constants.every12Hours');
    },
  },
  {
    value: '24h',
    get label() {
      return i18n.t('settings.constants.every24HoursNightly');
    },
  },
];

export const LISTING_SLA_OPTIONS: ListingSlaHours[] = [24, 48, 72];
export const SESSION_TIMEOUT_OPTIONS: SessionTimeoutMinutes[] = [15, 30, 60];
/** Số kết quả tối đa mỗi truy vấn tìm kiếm AI */
export const SEARCH_TOP_K_OPTIONS = [5, 10, 20, 30, 50];
/** Ngưỡng độ tương đồng tối thiểu (%) */
export const SIMILARITY_RANGE = { min: 50, max: 95 };
export const SIMILARITY_SCALE: { value: number; label: string }[] = [
  {
    value: 50,
    get label() {
      return i18n.t('settings.constants.n50Lenient');
    },
  },
  {
    value: 75,
    get label() {
      return i18n.t('settings.constants.n75Standard');
    },
  },
  {
    value: 85,
    get label() {
      return i18n.t('settings.constants.n85Recommended');
    },
  },
  {
    value: 95,
    get label() {
      return i18n.t('settings.constants.n95Strict');
    },
  },
];

/** Ví dụ hợp lệ: 118.70.192.0/24 */
export const CIDR_PATTERN =
  /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\/(3[0-2]|[12]?\d)$/;

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
  ipWhitelist: [
    { id: 'ip-hq', cidr: '118.70.192.0/24', label: 'HQ Hà Nội - Tầng 12 Keangnam' },
    { id: 'ip-dn', cidr: '14.238.45.12/28', label: 'Chi nhánh TP. Đà Nẵng' },
  ],
  minSimilarity: 75,
  mapSyncFrequency: '6h',
  searchTopK: 10,
};

/** Thông số hạ tầng hiển thị (chỉ đọc) */
export const PLATFORM_INFO = {
  releaseCode: 'v3.8.4 Enterprise LTS',
  get productionBadge() {
    return i18n.t('settings.constants.productionBuildV38');
  },
  dataCenter: 'Ho Chi Minh City Data Center (Zone VN-South-1)',
  get networkStatus() {
    return i18n.t('settings.constants.distributedSystemOperatingNormally');
  },
  storageUsedGb: 682,
  storageTotalGb: 1024,
  auditLogRetentionDays: 365,
  aiAccuracy: 96.4,
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
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
