import i18n from 'i18next';
import {
  CURRENT_SESSION_NETWORK,
  MOCK_ADMIN_ACTIVITIES,
  MOCK_ADMIN_DETAILS,
  MOCK_PAST_SESSIONS,
  MOCK_SECURITY_KEYS,
  MOCK_TOTP_CODE,
  MOCK_TOTP_SECRET,
} from '@/mocks/data/mockAdminProfile';
import type { AdminContactInfo, ProfileSnapshot, SecurityKey } from '@/types';
import { USE_MOCK_API } from './config';
import { ENDPOINTS } from './endpoints';
import { createSource, peek, writeRequest, writeRequestWithResult } from './request';

const MOCK_SNAPSHOT: ProfileSnapshot = {
  details: MOCK_ADMIN_DETAILS,
  pastSessions: MOCK_PAST_SESSIONS,
  securityKeys: MOCK_SECURITY_KEYS,
  activities: MOCK_ADMIN_ACTIVITIES,
};

/** Dữ liệu khởi tạo của store hồ sơ admin */
export const profileSource = createSource(ENDPOINTS.profile.snapshot, MOCK_SNAPSHOT);

/** Mã TOTP demo — chỉ hiển thị gợi ý khi đang chạy dữ liệu mẫu */
export const DEMO_TOTP_CODE: string | undefined = USE_MOCK_API ? MOCK_TOTP_CODE : undefined;

/** IP + vị trí của phiên hiện tại (khi dùng API, danh sách phiên thật do server trả về) */
export const currentSessionNetwork = peek(() => CURRENT_SESSION_NETWORK) ?? {
  ip: '—',
  get location() {
    return i18n.t('services.profileService.currentDevice');
  },
};

export const profileService = {
  updateContact: (info: AdminContactInfo) => writeRequest(ENDPOINTS.profile.contact, 'PUT', info),
  /** Khóa bí mật có sẵn ngay ở chế độ mock (undefined khi dùng API — cần gọi startTotpSetup) */
  peekTotpSetup: () => peek(() => ({ secret: MOCK_TOTP_SECRET })),
  /** Server sinh khóa bí mật TOTP mới để liên kết lại ứng dụng xác thực */
  startTotpSetup: () =>
    writeRequestWithResult<{ secret: string }>(ENDPOINTS.profile.totpSetup, 'POST', {}, () => ({
      secret: MOCK_TOTP_SECRET,
    })),
  /** Xác minh mã 6 số từ ứng dụng xác thực */
  verifyTotp: (code: string) =>
    writeRequestWithResult<{ valid: boolean }>(
      ENDPOINTS.profile.totpVerify,
      'POST',
      { code },
      () => ({ valid: code === MOCK_TOTP_CODE }),
    ),
  reconfigureTotp: () => writeRequest(ENDPOINTS.profile.totp, 'POST'),
  /** Server sinh bộ mã mới; ở chế độ mock dùng bộ mã client vừa tạo */
  regenerateBackupCodes: (localCodes: string[]) =>
    writeRequestWithResult<{ codes: string[] }>(ENDPOINTS.profile.backupCodes, 'POST', {}, () => ({
      codes: localCodes,
    })),
  addSecurityKey: (key: SecurityKey) => writeRequest(ENDPOINTS.profile.securityKeys, 'POST', key),
  revokeOtherSessions: () => writeRequest(ENDPOINTS.profile.revokeSessions, 'POST'),
};
