import { createContext } from 'react';
import type { SettingsMeta, SystemSettings } from '../types/admin';

export interface SettingsContextValue {
  settings: SystemSettings;
  meta: SettingsMeta;
  saveSettings: (settings: SystemSettings) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
