import i18n from 'i18next';
import type {
  TranslationKey,
  SelectOption,
  UserAccountType,
  UserFilters,
  UserJoinedRange,
  UserStatus,
} from '@/types';
import { linkedOption, localizeConfig, localizeLabels, localizedOption } from '@/utils/localize';

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; filterLabel: string; badgeClass: string; dotClass: string }
> = localizeConfig(
  'status.user',
  {
    active: {
      label: 'Hoạt động',
      filterLabel: 'Đang hoạt động',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      dotClass: 'bg-primary',
    },
    suspended: {
      label: 'Tạm khóa',
      filterLabel: 'Đang khóa / Tạm đình chỉ',
      badgeClass: 'bg-error-container text-on-error-container',
      dotClass: 'bg-error',
    },
  },
  ['label', 'filterLabel'],
);

export const USER_ACCOUNT_TYPE_LABELS: Record<UserAccountType, string> = localizeLabels(
  'category.userAccountType',
  {
    standard: 'Thành viên Tiêu chuẩn',
    vip: 'Thành viên VIP',
    partner: 'Đối tác liên kết',
  },
);

export const USER_STATUS_OPTIONS: SelectOption<UserStatus | 'all'>[] = [
  localizedOption('all', 'filters.userStatusAll', 'Trạng thái: Tất cả'),
  linkedOption('active', () => USER_STATUS_CONFIG.active.filterLabel),
  linkedOption('suspended', () => USER_STATUS_CONFIG.suspended.filterLabel),
];

export const USER_ACCOUNT_TYPE_OPTIONS: SelectOption<UserAccountType | 'all'>[] = [
  localizedOption('all', 'filters.accountTypeAll', 'Loại tài khoản: Tất cả'),
  ...(Object.keys(USER_ACCOUNT_TYPE_LABELS) as UserAccountType[]).map((type) =>
    linkedOption(type, () => USER_ACCOUNT_TYPE_LABELS[type]),
  ),
];

export const USER_JOINED_OPTIONS: SelectOption<UserJoinedRange>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('users.constants.signUpDateAll');
    },
  },
  {
    value: '30days',
    get label() {
      return i18n.t('users.constants.last30Days');
    },
  },
  {
    value: 'quarter',
    get label() {
      return i18n.t('users.constants.thisQuarter');
    },
  },
  {
    value: 'year',
    get label() {
      return i18n.t('users.constants.last12Months');
    },
  },
];

export const DEFAULT_USER_FILTERS: UserFilters = {
  keyword: '',
  status: 'all',
  accountType: 'all',
  joined: 'all',
};

/** Lý do khóa tài khoản — key bản dịch, hiển thị bằng t(key) */
export const USER_LOCK_REASONS = [
  'users.lockReasons.spamReviews',
  'users.lockReasons.inappropriateContent',
  'users.lockReasons.promotionFraud',
  'users.lockReasons.compromised',
  'users.lockReasons.userRequest',
] as const satisfies readonly TranslationKey[];

/** Tên thành phố là tên riêng (giá trị lưu vào hồ sơ) — không dịch */

export const USER_CITIES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Huế',
  'Nha Trang',
  'Cần Thơ',
  'Hải Phòng',
  'Hội An',
  'Đà Lạt',
  'Phú Quốc',
];
