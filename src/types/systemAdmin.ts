/** Cài đặt hệ thống thật (system_settings), nhật ký hoạt động, tình trạng dịch vụ ngoài */

export interface GeneralSettingsForm {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
}

export interface RuleSettingsForm {
  maxPlaceImages: number;
  maxImageMb: number;
  renewalNoticeDays: number;
  paymentLinkMinutes: number;
}

export type AnnouncementLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type AnnouncementAudience = 'ALL' | 'TRAVELLER' | 'PARTNER';
export type AnnouncementState = 'OFF' | 'SCHEDULED' | 'LIVE' | 'ENDED';

export interface AnnouncementForm {
  enabled: boolean;
  message: string;
  level: AnnouncementLevel;
  audience: AnnouncementAudience;
  /** ISO; null = hiện ngay */
  startsAt: string | null;
  /** ISO; null = hiện đến khi tắt */
  endsAt: string | null;
}

export interface SettingsSectionMeta {
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface PlatformSettingsView {
  general: GeneralSettingsForm;
  generalMeta: SettingsSectionMeta;
  rules: RuleSettingsForm;
  rulesMeta: SettingsSectionMeta;
  announcement: AnnouncementForm;
  announcementMeta: SettingsSectionMeta;
  announcementState: AnnouncementState;
}

export interface AuditLogItem {
  id: number;
  action: string;
  entityName: string | null;
  entityId: number | null;
  description: string | null;
  actorId: number | null;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: string;
}

export interface AuditActor {
  id: number;
  name: string | null;
  email: string | null;
}

export interface AuditFilters {
  actions: string[];
  actors: AuditActor[];
}

export interface AuditLogQuery {
  keyword?: string;
  action?: string;
  actorId?: number;
  /** yyyy-MM-dd */
  from?: string;
  to?: string;
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}

/** CONFIGURED: dịch vụ chỉ kiểm tra được cấu hình (không có kiểm tra kết nối) */
export type IntegrationState = 'OK' | 'ERROR' | 'NOT_CONFIGURED' | 'UNCHECKED' | 'CONFIGURED';

export interface IntegrationStatus {
  key: string;
  name: string;
  purpose: string;
  configured: boolean;
  checkable: boolean;
  status: IntegrationState;
  message: string;
  latencyMs: number | null;
  checkedAt: string | null;
  details: Record<string, string | number | boolean | null>;
}

/** GET /api/site-info */
export interface SiteInfo {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  limits: { maxPlaceImages: number; maxImageMb: number };
  announcement: {
    message: string;
    level: AnnouncementLevel;
    audience: AnnouncementAudience;
    endsAt: string | null;
    version: number;
  } | null;
}
