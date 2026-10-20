import type { NotificationRules, SettingsTab, SystemSettings } from '../../types/admin';

export type SettingsFieldChange = <K extends keyof SystemSettings>(
  key: K,
  value: SystemSettings[K],
) => void;

/** Trường cấu hình thuộc tab nào (để hiện chấm "chưa lưu" trên tab) */
const FIELD_TABS: Record<keyof SystemSettings, Exclude<SettingsTab, 'notifications'>> = {
  platformName: 'general',
  timezone: 'general',
  englishFallback: 'general',
  listingSlaHours: 'listing',
  requireLegalDocs: 'listing',
  gpsDuplicateCheck: 'listing',
  autoEmailPartnerResult: 'listing',
  poiTrustThreshold: 'ai',
  mapSyncFrequency: 'ai',
  maxPoiPerDay: 'ai',
  twoFactorRequired: 'security',
  sessionTimeoutMinutes: 'security',
  ipWhitelist: 'security',
};

const isSame = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function getDirtyTabs(
  draft: SystemSettings,
  saved: SystemSettings,
  draftRules: NotificationRules,
  savedRules: NotificationRules,
): Set<SettingsTab> {
  const tabs = new Set<SettingsTab>();
  (Object.keys(FIELD_TABS) as (keyof SystemSettings)[]).forEach((key) => {
    if (!isSame(draft[key], saved[key])) tabs.add(FIELD_TABS[key]);
  });
  if (!isSame(draftRules, savedRules)) tabs.add('notifications');
  return tabs;
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** "14:32:08 - 24/10/2024" */
export function formatSettingsTimestamp(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} - ${pad(
    date.getDate(),
  )}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
