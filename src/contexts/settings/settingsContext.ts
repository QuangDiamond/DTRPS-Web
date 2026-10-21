import { createContext } from 'react';
import type { DataStatus, SettingsMeta, SystemSettings } from '@/types';

export interface SettingsContextValue {
  settings: SystemSettings;
  meta: SettingsMeta;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  saveSettings: (settings: SystemSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
