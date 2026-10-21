import i18n from 'i18next';
import { PASSWORD_ROTATION_DAYS } from '@/constants/adminProfile';
import { PASSWORD_RULES } from '@/constants/auth';
import type {
  AdminAccountDetails,
  PasswordStrength,
  SecurityCheckItem,
  SecurityKey,
  SystemSettings,
} from '@/types';

export function getPasswordStrength(password: string): PasswordStrength {
  const score = password ? PASSWORD_RULES.filter((rule) => rule.test(password)).length : 0;
  if (score >= 4 && password.length >= 12) {
    return {
      score: 4,
      label: i18n.t('profile.utils.veryStrong'),
      barClass: 'bg-primary',
      textClass: 'text-primary',
    };
  }
  if (score >= 4) {
    return {
      score: 4,
      label: i18n.t('profile.utils.strong'),
      barClass: 'bg-primary',
      textClass: 'text-primary',
    };
  }
  if (score === 3) {
    return {
      score,
      label: i18n.t('profile.utils.fair'),
      barClass: 'bg-secondary',
      textClass: 'text-secondary',
    };
  }
  if (score === 2) {
    return {
      score,
      label: i18n.t('profile.utils.medium'),
      barClass: 'bg-tertiary',
      textClass: 'text-tertiary',
    };
  }
  return {
    score,
    label: password ? i18n.t('profile.utils.weak') : i18n.t('profile.utils.notEntered'),
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
      label: i18n.t('profile.utils.twoFactorAuthentication2fa'),
      detail: settings.twoFactorRequired
        ? i18n.t('profile.utils.enabledSystemSettings')
        : i18n.t('profile.utils.disabledTurnItBack'),
      passed: settings.twoFactorRequired,
    },
    {
      id: 'fido2',
      label: i18n.t('profile.utils.fido2HardwareKeyLinked'),
      detail:
        keys.length > 0
          ? i18n.t('profile.utils.activeKeys', { count: keys.length })
          : i18n.t('profile.utils.noKeysLinked'),
      passed: keys.length > 0,
    },
    {
      id: 'password',
      label: i18n.t('profile.utils.passwordChangedWithinDays', { PASSWORD_ROTATION_DAYS }),
      detail: i18n.t('profile.utils.lastChangedDaysAgo', { count: passwordAge }),
      passed: passwordAge <= PASSWORD_ROTATION_DAYS,
    },
    {
      id: 'backup',
      label: i18n.t('profile.utils.backupRecoveryCodesAvailable'),
      detail: i18n.t('profile.utils.unusedCodes', { count: details.backupCodes.length }),
      passed: details.backupCodes.length >= 3,
    },
    {
      id: 'ip',
      label: i18n.t('profile.utils.adminPortalIpRange'),
      detail:
        settings.ipWhitelist.length > 0
          ? i18n.t('profile.utils.allowedIpRanges', { count: settings.ipWhitelist.length })
          : i18n.t('profile.utils.noIpRestrictionAny'),
      passed: settings.ipWhitelist.length > 0,
    },
    {
      id: 'timeout',
      label: i18n.t('profile.utils.autoSignOutAfter'),
      detail: i18n.t('profile.utils.currentlyMinutes', {
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      }),
      passed: settings.sessionTimeoutMinutes <= 30,
    },
  ];
}

export function securityScore(checks: SecurityCheckItem[]): number {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
}

export function securityTier(score: number): string {
  if (score >= 100) return i18n.t('profile.utils.enterpriseGradeSecurityLevel');
  if (score >= 80) return i18n.t('profile.utils.level3SecurityNeeds');
  if (score >= 50) return i18n.t('profile.utils.level2SecurityMedium');
  return i18n.t('profile.utils.highRiskActNow');
}
