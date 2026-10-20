import {
  MOCK_ADMIN_ACTIVITIES,
  MOCK_ADMIN_DETAILS,
  MOCK_PAST_SESSIONS,
  MOCK_SECURITY_KEYS,
} from '../constants/adminProfile';
import type { AdminContactInfo, SecurityKey } from '../types/admin';
import type { ProfileSnapshot } from '../types/api';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest, writeRequestWithResult } from './request';

const MOCK_SNAPSHOT: ProfileSnapshot = {
  details: MOCK_ADMIN_DETAILS,
  pastSessions: MOCK_PAST_SESSIONS,
  securityKeys: MOCK_SECURITY_KEYS,
  activities: MOCK_ADMIN_ACTIVITIES,
};

/** Dữ liệu khởi tạo của store hồ sơ admin */
export const profileSource = createSource(ENDPOINTS.profile.snapshot, MOCK_SNAPSHOT);

export const profileService = {
  updateContact: (info: AdminContactInfo) => writeRequest(ENDPOINTS.profile.contact, 'PUT', info),
  reconfigureTotp: () => writeRequest(ENDPOINTS.profile.totp, 'POST'),
  /** Server sinh bộ mã mới; ở chế độ mock dùng bộ mã client vừa tạo */
  regenerateBackupCodes: (localCodes: string[]) =>
    writeRequestWithResult<{ codes: string[] }>(ENDPOINTS.profile.backupCodes, 'POST', {}, () => ({
      codes: localCodes,
    })),
  addSecurityKey: (key: SecurityKey) => writeRequest(ENDPOINTS.profile.securityKeys, 'POST', key),
  revokeOtherSessions: () => writeRequest(ENDPOINTS.profile.revokeSessions, 'POST'),
};
