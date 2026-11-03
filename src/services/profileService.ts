import i18n from 'i18next';
import type { AdminContactInfo, ProfileSnapshot, SecurityKey } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest, writeRequestWithResult } from './request';

/** Dữ liệu khởi tạo của store hồ sơ admin */
export const profileSource = createSource<ProfileSnapshot>(ENDPOINTS.profile.snapshot);

/** IP + vị trí của phiên hiện tại (danh sách phiên thật do server trả về) */
export const currentSessionNetwork = {
  ip: '—',
  get location() {
    return i18n.t('services.profileService.currentDevice');
  },
};

export const profileService = {
  updateContact: (info: AdminContactInfo) => writeRequest(ENDPOINTS.profile.contact, 'PUT', info),
  /** Server sinh khóa bí mật TOTP mới để liên kết lại ứng dụng xác thực */
  startTotpSetup: () =>
    writeRequestWithResult<{ secret: string }>(ENDPOINTS.profile.totpSetup, 'POST', {}),
  /** Xác minh mã 6 số từ ứng dụng xác thực */
  verifyTotp: (code: string) =>
    writeRequestWithResult<{ valid: boolean }>(ENDPOINTS.profile.totpVerify, 'POST', { code }),
  reconfigureTotp: () => writeRequest(ENDPOINTS.profile.totp, 'POST'),
  /** Server sinh bộ mã dự phòng mới */
  regenerateBackupCodes: () =>
    writeRequestWithResult<{ codes: string[] }>(ENDPOINTS.profile.backupCodes, 'POST', {}),
  addSecurityKey: (key: SecurityKey) => writeRequest(ENDPOINTS.profile.securityKeys, 'POST', key),
  revokeOtherSessions: () => writeRequest(ENDPOINTS.profile.revokeSessions, 'POST'),
};
