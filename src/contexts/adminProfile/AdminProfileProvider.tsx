import i18n from 'i18next';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useAuth, useInitialData, usePersist } from '@/hooks';
import * as authService from '@/services/authService';
import { currentSessionNetwork, profileService, profileSource } from '@/services/profileService';
import type {
  AdminAccountDetails,
  AdminActivity,
  AdminContactInfo,
  AdminSession,
  SecurityKey,
} from '@/types';
import { generateBackupCodes } from '@/utils/backupCodes';
import { describeCurrentDevice } from '@/utils/device';
import { AdminProfileContext } from './adminProfileContext';

const EMPTY_DETAILS: AdminAccountDetails = {
  id: '',
  fullName: '',
  socAlertEmail: '',
  hotline: '',
  jobTitle: '',
  department: '',
  passwordChangedAt: new Date().toISOString(),
  totpEnabledAt: new Date().toISOString(),
  backupCodes: [],
};

function createCurrentSession(): AdminSession {
  const device = describeCurrentDevice();
  return {
    id: 'SES-CURRENT',
    device: device.label,
    icon: device.icon,
    ip: currentSessionNetwork.ip,
    location: currentSessionNetwork.location,
    signedInAt: new Date().toISOString(),
    status: 'current',
  };
}

const randomSerial = (): string =>
  `YBK-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(
    Math.floor(Math.random() * 1000),
  ).padStart(3, '0')}`;

/** Store hồ sơ & bảo mật của admin đang đăng nhập — đọc/ghi qua profileService (API /me) */
export default function AdminProfileProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = profileSource.seed;
  const [details, setDetails] = useState<AdminAccountDetails>(seed?.details ?? EMPTY_DETAILS);
  const [sessions, setSessions] = useState<AdminSession[]>(() => [
    createCurrentSession(),
    ...(seed?.pastSessions ?? []),
  ]);
  const [securityKeys, setSecurityKeys] = useState<SecurityKey[]>(seed?.securityKeys ?? []);
  const [activities, setActivities] = useState<AdminActivity[]>(seed?.activities ?? []);

  const dataStatus = useInitialData(
    profileSource,
    (snapshot) => {
      setDetails(snapshot.details);
      setSessions((current) => [
        ...current.filter((session) => session.status === 'current'),
        ...snapshot.pastSessions,
      ]);
      setSecurityKeys(snapshot.securityKeys);
      setActivities(snapshot.activities);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;
  const seqRef = useRef(0);

  const nextId = useCallback((prefix: string) => {
    seqRef.current += 1;
    return `${prefix}-${Date.now()}-${seqRef.current}`;
  }, []);

  const logActivity = useCallback(
    (icon: string, title: string, detail: string) => {
      setActivities((current) => [
        {
          id: nextId('ACT'),
          icon,
          title,
          detail,
          createdAt: new Date().toISOString(),
          ip: currentSessionNetwork.ip,
        },
        ...current,
      ]);
    },
    [nextId],
  );

  const updateContact = useCallback(
    (info: AdminContactInfo) => {
      setDetails((current) => ({ ...current, ...info }));
      logActivity(
        'badge',
        i18n.t('stores.adminProfile.contactInformationUpdated'),
        i18n.t('stores.adminProfile.fullNameSocEmail', { hotline: info.hotline }),
      );
      persist(
        profileService.updateContact(info),
        i18n.t('stores.adminProfile.couldNotSaveContact'),
      );
    },
    [logActivity, persist],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!admin) throw new Error(i18n.t('auth.errors.sessionExpired'));
      await authService.changePassword(admin.email, currentPassword, newPassword);
      setDetails((current) => ({ ...current, passwordChangedAt: new Date().toISOString() }));
      logActivity(
        'vpn_key',
        i18n.t('stores.adminProfile.changeAccountPassword'),
        i18n.t('stores.adminProfile.administratorPasswordChanged'),
      );
    },
    [admin, logActivity],
  );

  const reconfigureTotp = useCallback(() => {
    setDetails((current) => ({ ...current, totpEnabledAt: new Date().toISOString() }));
    logActivity(
      'phone_android',
      i18n.t('stores.adminProfile.n2faReconfigured'),
      i18n.t('stores.adminProfile.relinkedGoogleAuthenticatorApp'),
    );
    persist(profileService.reconfigureTotp(), i18n.t('stores.adminProfile.couldNotSave2fa'));
  }, [logActivity, persist]);

  const regenerateBackupCodes = useCallback(() => {
    const codes = generateBackupCodes();
    setDetails((current) => ({ ...current, backupCodes: codes }));
    logActivity(
      'password',
      i18n.t('stores.adminProfile.backupCodesRegenerated'),
      i18n.t('stores.adminProfile.newRecoveryCodesOld', { length: codes.length }),
    );
    // Khi dùng API, server sinh bộ mã chính thức → thay thế bộ mã tạm ở client
    persist(
      profileService.regenerateBackupCodes(codes).then(({ codes: serverCodes }) => {
        setDetails((current) => ({ ...current, backupCodes: serverCodes }));
      }),
      i18n.t('stores.adminProfile.couldNotGenerateNew'),
    );
    return codes;
  }, [logActivity, persist]);

  const addSecurityKey = useCallback(
    (name: string) => {
      const key: SecurityKey = {
        id: nextId('KEY'),
        name,
        serial: randomSerial(),
        addedAt: new Date().toISOString(),
      };
      setSecurityKeys((current) => [...current, key]);
      logActivity('usb', i18n.t('stores.adminProfile.fido2KeyLinked'), `${name} (${key.serial})`);
      persist(
        profileService.addSecurityKey(key),
        i18n.t('stores.adminProfile.couldNotSaveSecurity'),
      );
      return key;
    },
    [nextId, logActivity, persist],
  );

  const revokeOtherSessions = useCallback(() => {
    const count = sessionsRef.current.filter(
      (session) => session.status !== 'current' && session.status !== 'revoked',
    ).length;
    if (count > 0) {
      setSessions((current) =>
        current.map((session) =>
          session.status === 'current' ? session : { ...session, status: 'revoked' },
        ),
      );
      logActivity(
        'devices',
        i18n.t('stores.adminProfile.signedOutOtherDevices'),
        i18n.t('stores.adminProfile.revokedSignSessions', { count }),
      );
      persist(
        profileService.revokeOtherSessions(),
        i18n.t('stores.adminProfile.couldNotRevokeSign'),
      );
    }
    return count;
  }, [logActivity, persist]);

  const value = useMemo(
    () => ({
      details,
      sessions,
      securityKeys,
      activities,
      dataStatus,
      updateContact,
      changePassword,
      reconfigureTotp,
      regenerateBackupCodes,
      addSecurityKey,
      revokeOtherSessions,
    }),
    [
      details,
      sessions,
      securityKeys,
      activities,
      dataStatus,
      updateContact,
      changePassword,
      reconfigureTotp,
      regenerateBackupCodes,
      addSecurityKey,
      revokeOtherSessions,
    ],
  );

  return <AdminProfileContext.Provider value={value}>{children}</AdminProfileContext.Provider>;
}
