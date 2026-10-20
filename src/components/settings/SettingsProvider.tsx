import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SYSTEM_SETTINGS } from '../../constants/settings';
import { SettingsContext } from '../../contexts/settings';
import { useAuth } from '../../hooks/useAuth';
import { useInitialData } from '../../hooks/useInitialData';
import { usePersist } from '../../hooks/usePersist';
import { settingsService, settingsSource } from '../../services/settingsService';
import type { SettingsMeta, SystemSettings } from '../../types/admin';

const EMPTY_META: SettingsMeta = { updatedAt: '', updatedBy: '', updatedIp: '', syncedAt: '' };

/** Store cấu hình hệ thống — đọc/ghi qua settingsService (GET/PUT /settings) */
export default function SettingsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = settingsSource.seed;
  const [settings, setSettings] = useState<SystemSettings>(
    seed?.settings ?? DEFAULT_SYSTEM_SETTINGS,
  );
  const [meta, setMeta] = useState<SettingsMeta>(seed?.meta ?? EMPTY_META);
  const actor = admin ? `${admin.name} ${admin.role}` : 'Quản trị viên';

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
      setMeta((current) => ({ ...current, updatedAt: now, updatedBy: actor, syncedAt: now }));
      persist(settingsService.save(next), 'Không lưu được cấu hình hệ thống');
    },
    [actor, persist],
  );

  const value = useMemo(
    () => ({ settings, meta, dataStatus, saveSettings }),
    [settings, meta, dataStatus, saveSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
