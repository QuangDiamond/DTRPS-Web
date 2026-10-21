import i18n from 'i18next';
import type { AuthBrandContent, PasswordRule } from '@/types';

export const OTP_LENGTH = 6;
/** Mã OTP hết hạn sau 5 phút */
export const OTP_TTL_SECONDS = 300;
export const MAX_OTP_ATTEMPTS = 5;

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    get label() {
      return i18n.t('auth.constants.atLeast8Characters');
    },
    test: (value) => value.length >= 8,
  },
  {
    id: 'upper',
    get label() {
      return i18n.t('auth.constants.anUppercaseLetterZ');
    },
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    get label() {
      return i18n.t('auth.constants.aNumber09');
    },
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    get label() {
      return i18n.t('auth.constants.aSpecialCharacter');
    },
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export const LOGIN_BRAND_CONTENT: AuthBrandContent = {
  get statusText() {
    return i18n.t('auth.constants.infrastructureV384');
  },
  get title() {
    return i18n.t('auth.constants.comprehensiveOperationsManagementSystem');
  },
  get description() {
    return i18n.t('auth.constants.vietnamSCentralSmart');
  },
  features: [
    {
      icon: 'security',
      get title() {
        return i18n.t('auth.constants.multiLayerSecurityZero');
      },
      get description() {
        return i18n.t('auth.constants.hardwareCertificateAuthenticationReal');
      },
    },
    {
      icon: 'insights',
      get title() {
        return i18n.t('auth.constants.realTimeDataManagement');
      },
      get description() {
        return i18n.t('auth.constants.syncsInternationalVisitorFlows');
      },
    },
    {
      icon: 'verified',
      get title() {
        return i18n.t('auth.constants.automatedPartnerListingReview');
      },
      get description() {
        return i18n.t('auth.constants.aiAssistedReviewHotels');
      },
    },
  ],
};

export const RECOVERY_BRAND_CONTENT: AuthBrandContent = {
  get statusText() {
    return i18n.t('auth.constants.infrastructureV384');
  },
  get title() {
    return i18n.t('auth.constants.adminAccountSecurityRecovery');
  },
  get description() {
    return i18n.t('auth.constants.multiLayerAuthenticationSecure');
  },
  features: [
    {
      icon: 'pin',
      get title() {
        return i18n.t('auth.constants.highlySecure6Digit');
      },
      get description() {
        return i18n.t('auth.constants.shortValidityAutomaticallyExpires');
      },
    },
    {
      icon: 'lock_clock',
      get title() {
        return i18n.t('auth.constants.temporaryLockAfterMore');
      },
      get description() {
        return i18n.t('auth.constants.protectsAdminAccountsAgainst');
      },
    },
    {
      icon: 'shield_person',
      get title() {
        return i18n.t('auth.constants.twoFactorAuthentication2fa');
      },
      get description() {
        return i18n.t('auth.constants.ensuresOnlyRightfulAccount');
      },
    },
  ],
};
