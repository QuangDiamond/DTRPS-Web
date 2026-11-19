/** Cài đặt hệ thống, nhật ký hoạt động, tình trạng dịch vụ ngoài (admin) — API thật */
import type {
  AnnouncementForm,
  AuditFilters,
  AuditLogItem,
  AuditLogQuery,
  GeneralSettingsForm,
  IntegrationStatus,
  Paged,
  PlatformSettingsView,
  RuleSettingsForm,
  SiteInfo,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

export const systemAdminService = {
  settings: () => apiRequest<PlatformSettingsView>(ENDPOINTS.system.settings),
  saveGeneral: (form: GeneralSettingsForm) =>
    apiRequest<PlatformSettingsView>(ENDPOINTS.system.settingsSection('general'), {
      method: 'PUT',
      body: form,
    }),
  saveRules: (form: RuleSettingsForm) =>
    apiRequest<PlatformSettingsView>(ENDPOINTS.system.settingsSection('rules'), {
      method: 'PUT',
      body: form,
    }),
  saveAnnouncement: (form: AnnouncementForm) =>
    apiRequest<PlatformSettingsView>(ENDPOINTS.system.settingsSection('announcement'), {
      method: 'PUT',
      body: form,
    }),

  auditLogs: ({ keyword, action, actorId, from, to, page, size }: AuditLogQuery) =>
    apiRequest<Paged<AuditLogItem>>(ENDPOINTS.system.auditLogs, {
      query: {
        page,
        size,
        keyword: keyword?.trim() || undefined,
        action: action || undefined,
        actorId,
        from: from || undefined,
        to: to || undefined,
      },
    }),
  auditFilters: () => apiRequest<AuditFilters>(ENDPOINTS.system.auditFilters),

  integrations: () => apiRequest<IntegrationStatus[]>(ENDPOINTS.system.integrations),
  checkIntegration: (key: string) =>
    apiRequest<IntegrationStatus>(ENDPOINTS.system.integrationCheck(key), { method: 'POST' }),

  siteInfo: () => apiRequest<SiteInfo>(ENDPOINTS.system.siteInfo),
};
