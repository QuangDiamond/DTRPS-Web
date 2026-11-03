import type { SettingsSnapshot, SystemSettings } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest } from './request';

/** Dữ liệu khởi tạo của store cài đặt hệ thống */
export const settingsSource = createSource<SettingsSnapshot>(ENDPOINTS.settings.snapshot);

export const settingsService = {
  save: (settings: SystemSettings) => writeRequest(ENDPOINTS.settings.snapshot, 'PUT', settings),
};
