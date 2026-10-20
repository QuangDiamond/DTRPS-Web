import { PASSWORD_RULES } from '../../constants/auth';
import { PASSWORD_ROTATION_DAYS } from '../../constants/adminProfile';
import type {
  AdminAccountDetails,
  SecurityCheckItem,
  SecurityKey,
  SystemSettings,
} from '../../types/admin';

export interface PasswordStrength {
  /** Số quy tắc đạt (0 - 4) */
  score: number;
  label: string;
  barClass: string;
  textClass: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  const score = password ? PASSWORD_RULES.filter((rule) => rule.test(password)).length : 0;
  if (score >= 4 && password.length >= 12) {
    return {
      score: 4,
      label: 'Rất mạnh',
      barClass: 'bg-primary',
      textClass: 'text-primary',
    };
  }
  if (score >= 4) {
    return { score: 4, label: 'Mạnh', barClass: 'bg-primary', textClass: 'text-primary' };
  }
  if (score === 3) {
    return { score, label: 'Khá', barClass: 'bg-secondary', textClass: 'text-secondary' };
  }
  if (score === 2) {
    return { score, label: 'Trung bình', barClass: 'bg-tertiary', textClass: 'text-tertiary' };
  }
  return {
    score,
    label: password ? 'Yếu' : 'Chưa nhập',
    barClass: 'bg-error',
    textClass: 'text-error',
  };
}

export const daysSince = (isoDateTime: string, now: Date = new Date()): number =>
  Math.floor((now.getTime() - new Date(isoDateTime).getTime()) / 86_400_000);

/** Bộ kiểm tra bảo mật dùng cho nút "Kiểm tra bảo mật hệ thống" và thẻ "Chỉ số an toàn phiên" */
export function runSecurityChecks(
  details: AdminAccountDetails,
  keys: SecurityKey[],
  settings: SystemSettings,
): SecurityCheckItem[] {
  const passwordAge = daysSince(details.passwordChangedAt);
  return [
    {
      id: '2fa',
      label: 'Bắt buộc xác thực 2 bước (2FA) cho quản trị viên',
      detail: settings.twoFactorRequired
        ? 'Đang bật trong Cài đặt hệ thống'
        : 'Đang tắt — bật lại tại Cài đặt hệ thống › Bảo mật',
      passed: settings.twoFactorRequired,
    },
    {
      id: 'fido2',
      label: 'Khóa phần cứng FIDO2 đã liên kết',
      detail: keys.length > 0 ? `${keys.length} khóa đang hoạt động` : 'Chưa liên kết khóa nào',
      passed: keys.length > 0,
    },
    {
      id: 'password',
      label: `Mật khẩu được đổi trong vòng ${PASSWORD_ROTATION_DAYS} ngày`,
      detail: `Lần đổi gần nhất cách đây ${passwordAge} ngày`,
      passed: passwordAge <= PASSWORD_ROTATION_DAYS,
    },
    {
      id: 'backup',
      label: 'Còn mã khôi phục dự phòng',
      detail: `${details.backupCodes.length} mã chưa sử dụng`,
      passed: details.backupCodes.length >= 3,
    },
    {
      id: 'ip',
      label: 'Giới hạn dải IP truy cập cổng quản trị',
      detail:
        settings.ipWhitelist.length > 0
          ? `${settings.ipWhitelist.length} dải IP được phép`
          : 'Chưa giới hạn IP — mọi địa chỉ đều truy cập được',
      passed: settings.ipWhitelist.length > 0,
    },
    {
      id: 'timeout',
      label: 'Tự động đăng xuất khi không thao tác ≤ 30 phút',
      detail: `Đang đặt ${settings.sessionTimeoutMinutes} phút`,
      passed: settings.sessionTimeoutMinutes <= 30,
    },
  ];
}

export function securityScore(checks: SecurityCheckItem[]): number {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
}

export function securityTier(score: number): string {
  if (score >= 100) return 'Bảo mật cấp độ doanh nghiệp (cấp 4)';
  if (score >= 80) return 'Bảo mật cấp 3 — cần rà soát';
  if (score >= 50) return 'Bảo mật cấp 2 — rủi ro trung bình';
  return 'Rủi ro cao — cần xử lý ngay';
}
