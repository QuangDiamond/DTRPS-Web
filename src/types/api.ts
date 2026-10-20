/** Kiểu dữ liệu của lớp service (hợp đồng với backend) */
import type {
  ActivityItem,
  AdminAccountDetails,
  AdminActivity,
  AdminNotification,
  AdminSession,
  AppUser,
  CategoryShare,
  DashboardStats,
  GrowthPoint,
  Listing,
  ListingStats,
  NotificationRules,
  NotificationStats,
  Partner,
  PartnerStats,
  Poi,
  PoiStats,
  SecurityKey,
  SettingsMeta,
  SystemSettings,
  UserStats,
} from './admin';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Trạng thái tải dữ liệu của một store — dùng cho cổng loading/lỗi trong AdminLayout */
export interface DataStatus {
  status: LoadStatus;
  error: string | null;
  reload: () => void;
}

/**
 * Nguồn dữ liệu của một store:
 * - seed: dữ liệu khởi tạo có sẵn ngay (chế độ mock) — undefined khi gọi API thật
 * - load: tải lại toàn bộ từ server
 */
export interface DataSource<S> {
  seed: S | undefined;
  load: () => Promise<S>;
}

export interface ListingsSnapshot {
  listings: Listing[];
  activities: ActivityItem[];
  /** Số liệu toàn hệ thống tại thời điểm tải */
  stats: ListingStats;
}

export interface PartnersSnapshot {
  partners: Partner[];
  stats: PartnerStats;
}

export interface UsersSnapshot {
  users: AppUser[];
  stats: UserStats;
}

export interface PoisSnapshot {
  pois: Poi[];
  stats: PoiStats;
}

export interface NotificationsSnapshot {
  notifications: AdminNotification[];
  stats: NotificationStats;
  rules: NotificationRules;
}

export interface SettingsSnapshot {
  settings: SystemSettings;
  meta: SettingsMeta;
}

export interface ProfileSnapshot {
  details: AdminAccountDetails;
  /** Các phiên đăng nhập trước phiên hiện tại */
  pastSessions: AdminSession[];
  securityKeys: SecurityKey[];
  activities: AdminActivity[];
}

export interface DashboardOverview {
  stats: DashboardStats;
  growthSeries: GrowthPoint[];
  categoryShares: CategoryShare[];
}
