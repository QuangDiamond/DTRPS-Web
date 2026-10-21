import i18n from 'i18next';
import type { AdminSessionStatus } from '@/types';

export const SESSION_STATUS_LABELS: Record<AdminSessionStatus, string> = {
  get current() {
    return i18n.t('profile.constants.thisSession');
  },
  get expired() {
    return i18n.t('profile.constants.expired');
  },
  get closed() {
    return i18n.t('profile.constants.closed');
  },
  get revoked() {
    return i18n.t('profile.constants.revoked');
  },
};

export const MAX_SECURITY_KEYS = 5;
/** Khuyến nghị đổi mật khẩu định kỳ (ISO 27001) */
export const PASSWORD_ROTATION_DAYS = 60;
export const ADMIN_PERMISSION_SUMMARY: {
  icon: string;
  title: string;
  level: string;
  description: string;
  tone: 'primary' | 'tertiary';
}[] = [
  {
    icon: 'group',
    get title() {
      return i18n.t('profile.constants.userManagement');
    },
    get level() {
      return i18n.t('profile.constants.fullAccess');
    },
    get description() {
      return i18n.t('profile.constants.createAssignPermissionsLock');
    },
    tone: 'primary',
  },
  {
    icon: 'store_mall_directory',
    get title() {
      return i18n.t('profile.constants.partnersListings');
    },
    get level() {
      return i18n.t('profile.constants.fullApproveCancelRights');
    },
    get description() {
      return i18n.t('profile.constants.approveTravelPartnersHotels');
    },
    tone: 'primary',
  },
  {
    icon: 'analytics',
    get title() {
      return i18n.t('profile.constants.financialReportsKpis');
    },
    get level() {
      return i18n.t('profile.constants.fullExportRights');
    },
    get description() {
      return i18n.t('profile.constants.accessBookingRevenueCommissions');
    },
    tone: 'primary',
  },
  {
    icon: 'neurology',
    get title() {
      return i18n.t('profile.constants.systemAiConfiguration');
    },
    get level() {
      return i18n.t('profile.constants.topLevelConfigurationRights');
    },
    get description() {
      return i18n.t('profile.constants.tuneAiItineraryRecommendation');
    },
    tone: 'tertiary',
  },
];
