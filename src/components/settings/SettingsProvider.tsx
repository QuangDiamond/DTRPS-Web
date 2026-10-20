import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SYSTEM_SETTINGS } from '../../constants/settings';
import { SettingsContext } from '../../contexts/settings';
import { useAuth } from '../../hooks/useAuth';
import type { SettingsMeta, SystemSettings } from '../../types/admin';

/** IP giả lập của máy quản trị — khi có backend lấy từ phiên đăng nhập */
const MOCK_ADMIN_IP = '118.70.192.14';

const INITIAL_META: SettingsMeta = {
  updatedAt: '2024-10-24T14:32:08+07:00',
  updatedBy: 'Quản trị viên Super Admin',
  updatedIp: MOCK_ADMIN_IP,
  syncedAt: new Date(Date.now() - 4 * 60_000).toISOString(),
};

/** Store cấu hình hệ thống. Khi có backend: thay bằng API GET/PUT /settings. */
export default function SettingsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [meta, setMeta] = useState<SettingsMeta>(INITIAL_META);
  const actor = admin ? `${admin.name} ${admin.role}` : 'Quản trị viên';

  const saveSettings = useCallback(
    (next: SystemSettings) => {
      const now = new Date().toISOString();
      setSettings(next);
      setMeta({ updatedAt: now, updatedBy: actor, updatedIp: MOCK_ADMIN_IP, syncedAt: now });
    },
    [actor],
  );

  const value = useMemo(() => ({ settings, meta, saveSettings }), [settings, meta, saveSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
