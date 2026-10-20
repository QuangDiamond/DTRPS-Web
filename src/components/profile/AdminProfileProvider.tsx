import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { CURRENT_SESSION_NETWORK } from '../../constants/adminProfile';
import { AdminProfileContext } from '../../contexts/adminProfile';
import { useAuth } from '../../hooks/useAuth';
import { useInitialData } from '../../hooks/useInitialData';
import { usePersist } from '../../hooks/usePersist';
import * as authService from '../../services/authService';
import { profileService, profileSource } from '../../services/profileService';
import type {
  AdminAccountDetails,
  AdminActivity,
  AdminContactInfo,
  AdminSession,
  SecurityKey,
} from '../../types/admin';
import { generateBackupCodes } from '../../utils/backupCodes';
import { describeCurrentDevice } from '../../utils/device';

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
    ip: CURRENT_SESSION_NETWORK.ip,
    location: CURRENT_SESSION_NETWORK.location,
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
          ip: CURRENT_SESSION_NETWORK.ip,
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
        'Cập nhật thông tin liên hệ',
        `Họ tên, email SOC và hotline: ${info.hotline}`,
      );
      persist(profileService.updateContact(info), 'Không lưu được thông tin liên hệ');
    },
    [logActivity, persist],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!admin) throw new Error('Phiên đăng nhập đã hết hạn');
      await authService.changePassword(admin.email, currentPassword, newPassword);
      setDetails((current) => ({ ...current, passwordChangedAt: new Date().toISOString() }));
      logActivity('vpn_key', 'Đổi mật khẩu tài khoản', 'Mật khẩu quản trị viên đã được thay đổi');
    },
    [admin, logActivity],
  );

  const reconfigureTotp = useCallback(() => {
    setDetails((current) => ({ ...current, totpEnabledAt: new Date().toISOString() }));
    logActivity('phone_android', 'Cấu hình lại 2FA', 'Liên kết lại ứng dụng Google Authenticator');
    persist(profileService.reconfigureTotp(), 'Không lưu được cấu hình 2FA');
  }, [logActivity, persist]);

  const regenerateBackupCodes = useCallback(() => {
    const codes = generateBackupCodes();
    setDetails((current) => ({ ...current, backupCodes: codes }));
    logActivity(
      'password',
      'Tạo lại mã dự phòng',
      `${codes.length} mã khôi phục mới, mã cũ bị vô hiệu`,
    );
    // Khi dùng API, server sinh bộ mã chính thức → thay thế bộ mã tạm ở client
    persist(
      profileService.regenerateBackupCodes(codes).then(({ codes: serverCodes }) => {
        setDetails((current) => ({ ...current, backupCodes: serverCodes }));
      }),
      'Không tạo được mã dự phòng mới',
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
      logActivity('usb', 'Liên kết khóa FIDO2', `${name} (${key.serial})`);
      persist(profileService.addSecurityKey(key), 'Không lưu được khóa bảo mật');
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
      logActivity('devices', 'Đăng xuất khỏi thiết bị khác', `Thu hồi ${count} phiên đăng nhập`);
      persist(profileService.revokeOtherSessions(), 'Không thu hồi được phiên đăng nhập');
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
