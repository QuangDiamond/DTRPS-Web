import i18n from 'i18next';
import type { AuthBrandContent, PasswordRule } from '@/types';

export const OTP_LENGTH = 6;
/** Mã OTP hết hạn sau 10 phút (app.otp.ttl bên backend) */
export const OTP_TTL_SECONDS = 600;
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

/** Cột trái màn đăng nhập admin — chỉ mô tả những gì hệ thống thực sự làm */
export const LOGIN_BRAND_CONTENT: AuthBrandContent = {
  get title() {
    return i18n.t('auth.constants.loginTitle');
  },
  get description() {
    return i18n.t('auth.constants.loginDescription');
  },
  features: [
    {
      icon: 'fact_check',
      get title() {
        return i18n.t('auth.constants.featureReviewTitle');
      },
      get description() {
        return i18n.t('auth.constants.featureReviewText');
      },
    },
    {
      icon: 'location_on',
      get title() {
        return i18n.t('auth.constants.featurePlacesTitle');
      },
      get description() {
        return i18n.t('auth.constants.featurePlacesText');
      },
    },
    {
      icon: 'group',
      get title() {
        return i18n.t('auth.constants.featureUsersTitle');
      },
      get description() {
        return i18n.t('auth.constants.featureUsersText');
      },
    },
  ],
};

/** Cột trái các màn khôi phục mật khẩu */
export const RECOVERY_BRAND_CONTENT: AuthBrandContent = {
  get title() {
    return i18n.t('auth.constants.recoveryTitle');
  },
  get description() {
    return i18n.t('auth.constants.recoveryDescription');
  },
  features: [],
};
