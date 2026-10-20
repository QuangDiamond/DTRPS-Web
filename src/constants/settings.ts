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
} from '../types/admin';

export const SETTINGS_TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'Cài đặt chung', icon: 'tune' },
  { id: 'listing', label: 'Quy tắc niêm yết & Thẩm định', icon: 'verified' },
  { id: 'ai', label: 'Cấu hình AI Planner & POI', icon: 'psychology' },
  { id: 'security', label: 'Bảo mật & Phân quyền quản trị', icon: 'security' },
  { id: 'notifications', label: 'Thông báo & Email cảnh báo', icon: 'notifications_active' },
];

export const TIMEZONE_OPTIONS: SelectOption<SystemTimezone>[] = [
  { value: 'gmt+7', label: 'GMT+7:00 (Hà Nội, Băng Cốc, Jakarta)' },
  { value: 'gmt+8', label: 'GMT+8:00 (Singapore, Bắc Kinh)' },
  { value: 'utc', label: 'GMT+0:00 (UTC)' },
];

export const MAP_SYNC_OPTIONS: SelectOption<MapSyncFrequency>[] = [
  { value: '1h', label: 'Mỗi 1 tiếng (Tần suất cao - Phí API cao)' },
  { value: '6h', label: 'Mỗi 6 tiếng (Khuyến nghị khi vận hành chính thức)' },
  { value: '12h', label: 'Mỗi 12 tiếng' },
  { value: '24h', label: 'Mỗi 24 tiếng (Hằng đêm lúc 02:00 AM)' },
];

export const LISTING_SLA_OPTIONS: ListingSlaHours[] = [24, 48, 72];
export const SESSION_TIMEOUT_OPTIONS: SessionTimeoutMinutes[] = [15, 30, 60];
export const MAX_POI_PER_DAY_OPTIONS = [3, 4, 5, 6, 7];
export const POI_TRUST_RANGE = { min: 50, max: 95 };
export const POI_TRUST_SCALE = ['50 (Lỏng)', '80 (Chuẩn)', '85 (Khuyên dùng)', '95 (Nghiêm ngặt)'];

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
  poiTrustThreshold: 85,
  mapSyncFrequency: '6h',
  maxPoiPerDay: 5,
};

/** Thông số hạ tầng hiển thị (chỉ đọc) */
export const PLATFORM_INFO = {
  releaseCode: 'v3.8.4 Enterprise LTS',
  productionBadge: 'Bản vận hành v3.8.4',
  dataCenter: 'Ho Chi Minh City Data Center (Zone VN-South-1)',
  networkStatus: 'Hệ thống phân tán hoạt động bình thường • Trễ mạng POI API: 24ms • Uptime 99.98%',
  storageUsedGb: 682,
  storageTotalGb: 1024,
  auditLogRetentionDays: 365,
  aiAccuracy: 96.4,
  hardwareKey: 'YubiKey',
};

export const PERMISSION_LEVEL_CONFIG: Record<
  PermissionLevel,
  { label: string; icon: string; className: string }
> = {
  full: { label: 'Toàn quyền', icon: 'verified_user', className: 'bg-primary/10 text-primary' },
  edit: {
    label: 'Xem & xử lý',
    icon: 'edit',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  view: {
    label: 'Chỉ xem',
    icon: 'visibility',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  none: { label: 'Không truy cập', icon: 'block', className: 'bg-error-container/60 text-error' },
};

export const PERMISSION_ROLES: {
  key: Exclude<keyof PermissionRow, 'module' | 'icon'>;
  label: string;
}[] = [
  { key: 'superAdmin', label: 'Super Admin' },
  { key: 'moderator', label: 'Kiểm duyệt viên' },
  { key: 'support', label: 'Hỗ trợ' },
];

export const PERMISSION_MATRIX: PermissionRow[] = [
  {
    module: 'Bảng điều khiển',
    icon: 'dashboard',
    superAdmin: 'full',
    moderator: 'view',
    support: 'view',
  },
  {
    module: 'Quản lý người dùng',
    icon: 'group',
    superAdmin: 'full',
    moderator: 'view',
    support: 'edit',
  },
  {
    module: 'Quản lý đối tác',
    icon: 'business_center',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'view',
  },
  {
    module: 'Quản lý niêm yết',
    icon: 'store_mall_directory',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'view',
  },
  { module: 'Điểm đến POI', icon: 'place', superAdmin: 'full', moderator: 'edit', support: 'view' },
  {
    module: 'Báo cáo & Thống kê',
    icon: 'bar_chart',
    superAdmin: 'full',
    moderator: 'view',
    support: 'none',
  },
  {
    module: 'Thông báo',
    icon: 'notifications',
    superAdmin: 'full',
    moderator: 'edit',
    support: 'edit',
  },
  {
    module: 'Cài đặt hệ thống',
    icon: 'settings',
    superAdmin: 'full',
    moderator: 'none',
    support: 'none',
  },
];
