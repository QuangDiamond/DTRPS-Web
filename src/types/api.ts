/** Kiểu dữ liệu của lớp service (hợp đồng với backend) */
import type { ActivityItem, CategoryShare, DashboardStats, GrowthPoint } from './dashboard';
import type { Listing, ListingStats } from './listing';
import type { AdminNotification, NotificationRules, NotificationStats } from './notification';
import type { Poi, PoiStats } from './poi';
import type { AdminAccountDetails, AdminActivity, AdminSession, SecurityKey } from './profile';
import type { SettingsMeta, SystemSettings } from './settings';
import type { AppUser, UserStats } from './user';

export type LoadStatus = 'loading' | 'ready' | 'error';

/** Trạng thái tải dữ liệu của một store — dùng cho cổng loading/lỗi trong AdminLayout */
export interface DataStatus {
  status: LoadStatus;
  error: string | null;
  reload: () => void;
}

/**
 * Nguồn dữ liệu của một store:
 * - seed: luôn undefined — dữ liệu được tải từ server
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
