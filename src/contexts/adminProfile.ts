import { createContext } from 'react';
import type {
  AdminAccountDetails,
  AdminActivity,
  AdminContactInfo,
  AdminSession,
  SecurityKey,
} from '../types/admin';
import type { DataStatus } from '../types/api';

export interface AdminProfileContextValue {
  details: AdminAccountDetails;
  sessions: AdminSession[];
  securityKeys: SecurityKey[];
  activities: AdminActivity[];
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  updateContact: (info: AdminContactInfo) => void;
  /** Ném lỗi nếu mật khẩu hiện tại sai */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  reconfigureTotp: () => void;
  regenerateBackupCodes: () => string[];
  addSecurityKey: (name: string) => SecurityKey;
  /** Trả về số phiên vừa thu hồi */
  revokeOtherSessions: () => number;
}

export const AdminProfileContext = createContext<AdminProfileContextValue | null>(null);
