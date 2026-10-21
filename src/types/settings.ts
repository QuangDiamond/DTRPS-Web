/** Cài đặt hệ thống */

export type SettingsTab = 'general' | 'listing' | 'security' | 'notifications';

export type SystemTimezone = 'gmt+7' | 'gmt+8' | 'utc';

export type ListingSlaHours = 24 | 48 | 72;

export type SessionTimeoutMinutes = 15 | 30 | 60;

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
}

export interface SettingsMeta {
  /** ISO datetime lần lưu cấu hình gần nhất */
  updatedAt: string;
  updatedBy: string;
}

export type PermissionLevel = 'full' | 'edit' | 'view' | 'none';

export interface PermissionRow {
  module: string;
  icon: string;
  superAdmin: PermissionLevel;
  moderator: PermissionLevel;
  support: PermissionLevel;
}
