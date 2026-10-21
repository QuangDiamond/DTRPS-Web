import i18n from 'i18next';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { DEFAULT_SYSTEM_SETTINGS } from '@/constants/settings';
import { useAuth, useInitialData, usePersist } from '@/hooks';
import { settingsService, settingsSource } from '@/services/settingsService';
import type { SettingsMeta, SystemSettings } from '@/types';
import { SettingsContext } from './settingsContext';

const EMPTY_META: SettingsMeta = { updatedAt: '', updatedBy: '' };

/** Store cấu hình hệ thống — đọc/ghi qua settingsService (GET/PUT /settings) */
export default function SettingsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = settingsSource.seed;
  const [settings, setSettings] = useState<SystemSettings>(
    seed?.settings ?? DEFAULT_SYSTEM_SETTINGS,
  );
  const [meta, setMeta] = useState<SettingsMeta>(seed?.meta ?? EMPTY_META);
  const actor = admin ? `${admin.name} ${admin.role}` : i18n.t('common.administrator');

  const dataStatus = useInitialData(
    settingsSource,
    (snapshot) => {
      setSettings(snapshot.settings);
      setMeta(snapshot.meta);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  const saveSettings = useCallback(
    (next: SystemSettings) => {
      const now = new Date().toISOString();
      setSettings(next);
      setMeta((current) => ({ ...current, updatedAt: now, updatedBy: actor }));
      persist(settingsService.save(next), i18n.t('stores.settings.couldNotSaveSystem'));
    },
    [actor, persist],
  );

  const value = useMemo(
    () => ({ settings, meta, dataStatus, saveSettings }),
    [settings, meta, dataStatus, saveSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
