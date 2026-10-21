import i18n from 'i18next';
import { DEFAULT_SYSTEM_SETTINGS } from '@/constants/settings';
import type { SettingsSnapshot, SystemSettings } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest } from './request';

const MOCK_SNAPSHOT: SettingsSnapshot = {
  settings: DEFAULT_SYSTEM_SETTINGS,
  meta: {
    updatedAt: '2024-10-24T14:32:08+07:00',
    get updatedBy() {
      return i18n.t('services.settingsService.superAdminAdministrator');
    },
  },
};

/** Dữ liệu khởi tạo của store cài đặt hệ thống */
export const settingsSource = createSource(ENDPOINTS.settings.snapshot, MOCK_SNAPSHOT);

export const settingsService = {
  save: (settings: SystemSettings) => writeRequest(ENDPOINTS.settings.snapshot, 'PUT', settings),
};
