/** Cài đặt hệ thống */

export type SettingsTab = 'general' | 'listing' | 'ai' | 'security' | 'notifications';

export type SystemTimezone = 'gmt+7' | 'gmt+8' | 'utc';

export type MapSyncFrequency = '1h' | '6h' | '12h' | '24h';

export type ListingSlaHours = 24 | 48 | 72;

export type SessionTimeoutMinutes = 15 | 30 | 60;

export interface IpWhitelistEntry {
  id: string;
  /** Ví dụ "118.70.192.0/24" */
  cidr: string;
  label: string;
}

export interface SystemSettings {
  platformName: string;
  timezone: SystemTimezone;
  /** Tiếng Việt luôn là ngôn ngữ chính; English là ngôn ngữ dự phòng */
  englishFallback: boolean;
  listingSlaHours: ListingSlaHours;
  requireLegalDocs: boolean;
  gpsDuplicateCheck: boolean;
  autoEmailPartnerResult: boolean;
  twoFactorRequired: boolean;
  sessionTimeoutMinutes: SessionTimeoutMinutes;
  ipWhitelist: IpWhitelistEntry[];
  /** Ngưỡng độ tương đồng tối thiểu (%) để một kết quả tìm kiếm AI được trả về, 50 - 95 */
  minSimilarity: number;
  mapSyncFrequency: MapSyncFrequency;
  /** Số kết quả tối đa mỗi truy vấn tìm kiếm AI (top-K) */
  searchTopK: number;
}

export interface SettingsMeta {
  /** ISO datetime lần lưu cấu hình gần nhất */
  updatedAt: string;
  updatedBy: string;
  updatedIp: string;
  /** ISO datetime lần đồng bộ cụm máy chủ gần nhất */
  syncedAt: string;
}

export type PermissionLevel = 'full' | 'edit' | 'view' | 'none';

export interface PermissionRow {
  module: string;
  icon: string;
  superAdmin: PermissionLevel;
  moderator: PermissionLevel;
  support: PermissionLevel;
}
