import { createContext } from 'react';
import type { SettingsMeta, SystemSettings } from '../types/admin';
import type { DataStatus } from '../types/api';

export interface SettingsContextValue {
  settings: SystemSettings;
  meta: SettingsMeta;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  saveSettings: (settings: SystemSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
