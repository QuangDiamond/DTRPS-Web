/** Hồ sơ Admin */

export interface AdminContactInfo {
  fullName: string;
  /** Email nhận cảnh báo khẩn cấp (SOC Alert) */
  socAlertEmail: string;
  hotline: string;
}

export interface AdminAccountDetails extends AdminContactInfo {
  id: string;
  jobTitle: string;
  department: string;
  /** ISO datetime */
  passwordChangedAt: string;
  totpEnabledAt: string;
  backupCodes: string[];
}

export type AdminSessionStatus = 'current' | 'expired' | 'closed' | 'revoked';

export interface AdminSession {
  id: string;
  device: string;
  icon: string;
  ip: string;
  location: string;
  /** ISO datetime */
  signedInAt: string;
  status: AdminSessionStatus;
}

export interface SecurityKey {
  id: string;
  name: string;
  serial: string;
  /** ISO datetime */
  addedAt: string;
}

export interface AdminActivity {
  id: string;
  icon: string;
  title: string;
  detail: string;
  /** ISO datetime */
  createdAt: string;
  ip: string;
}

export interface SecurityCheckItem {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
}

export interface PasswordStrength {
  /** Số quy tắc đạt (0 - 4) */
  score: number;
  label: string;
  barClass: string;
  textClass: string;
}
