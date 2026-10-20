import { useContext } from 'react';
import { SettingsContext, type SettingsContextValue } from '../contexts/settings';

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings phải được dùng bên trong <SettingsProvider>');
  }
  return context;
}
