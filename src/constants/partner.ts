import type {
  TranslationKey,
  PartnerFilters,
  PartnerPlaceStatus,
  PartnerStatus,
  PartnerType,
  ProvinceCode,
  SelectOption,
} from '@/types';
import { linkedOption, localizeConfig, localizedOption, localizeLabels } from '@/utils/localize';

interface PartnerTypeConfig {
  label: string;
  filterLabel: string;
  icon: string;
  /** Icon mặc định cho cơ sở khi tạo đối tác mới */
  defaultBusinessIcon: string;
  badgeClass: string;
  avatarClass: string;
}

export const PARTNER_TYPE_CONFIG: Record<PartnerType, PartnerTypeConfig> = localizeConfig(
  'category.partnerType',
  {
    hotel: {
      label: 'Lưu trú',
      filterLabel: 'Lưu trú',
      icon: 'bed',
      defaultBusinessIcon: 'cottage',
      badgeClass: 'bg-secondary-container/60 text-on-secondary-container',
      avatarClass: 'bg-secondary-container text-on-secondary-container',
    },
    fnb: {
      label: 'Ẩm thực',
      filterLabel: 'Ẩm thực',
      icon: 'dinner_dining',
      defaultBusinessIcon: 'restaurant',
      badgeClass: 'bg-tertiary-fixed/70 text-on-tertiary-fixed',
      avatarClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    },
    attraction: {
      label: 'Vui chơi & Tham quan',
      filterLabel: 'Vui chơi & Tham quan',
      icon: 'attractions',
      defaultBusinessIcon: 'attractions',
      badgeClass: 'bg-surface-container-high text-primary',
      avatarClass: 'bg-surface-container-high text-primary',
    },
    shopping: {
      label: 'Mua sắm & Đặc sản',
      filterLabel: 'Mua sắm & Đặc sản',
      icon: 'shopping_bag',
      defaultBusinessIcon: 'storefront',
      badgeClass: 'bg-error-container/60 text-on-error-container',
      avatarClass: 'bg-error-container/60 text-on-error-container',
    },
  },
  ['label', 'filterLabel'],
);

export const SUSPENDED_AVATAR_CLASS = 'bg-error-container/60 text-on-error-container';

interface PartnerStatusConfig {
  label: string;
  filterLabel: string;
  badgeClass: string;
  dotClass: string;
}

export const PARTNER_STATUS_CONFIG: Record<PartnerStatus, PartnerStatusConfig> = localizeConfig(
  'status.partner',
  {
    active: {
      label: 'Hoạt động',
      filterLabel: 'Đang hoạt động',
      badgeClass: 'bg-secondary-fixed text-on-secondary-fixed-variant',
      dotClass: 'bg-primary',
    },
    pending: {
      label: 'Chờ xác minh',
      filterLabel: 'Chờ xác minh',
      badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      dotClass: 'bg-tertiary',
    },
    suspended: {
      label: 'Đang khóa',
      filterLabel: 'Đang khóa / Đình chỉ',
      badgeClass: 'bg-error-container text-on-error-container',
      dotClass: 'bg-error',
    },
    rejected: {
      label: 'Bị từ chối',
      filterLabel: 'Bị từ chối',
      badgeClass: 'bg-surface-container-high text-on-surface-variant',
      dotClass: 'bg-outline',
    },
  },
  ['label', 'filterLabel'],
);

export const PROVINCE_LABELS: Record<ProvinceCode, string> = localizeLabels('province.full', {
  quangnam: 'Quảng Nam (Hội An)',
  danang: 'Đà Nẵng',
  hanoi: 'Hà Nội',
  hcm: 'TP. Hồ Chí Minh',
  kiengiang: 'Kiên Giang (Phú Quốc)',
  ninhbinh: 'Ninh Bình',
  quangngai: 'Quảng Ngãi',
  thanhhoa: 'Thanh Hóa (Sầm Sơn)',
});

/** Tên tỉnh ngắn gọn để hiển thị trong bảng */
export const PROVINCE_NAMES: Record<ProvinceCode, string> = localizeLabels('province.short', {
  quangnam: 'Quảng Nam',
  danang: 'Đà Nẵng',
  hanoi: 'Hà Nội',
  hcm: 'TP. Hồ Chí Minh',
  kiengiang: 'Kiên Giang',
  ninhbinh: 'Ninh Bình',
  quangngai: 'Quảng Ngãi',
  thanhhoa: 'Thanh Hóa',
});

const PARTNER_TYPES = Object.keys(PARTNER_TYPE_CONFIG) as PartnerType[];
const PARTNER_STATUSES = Object.keys(PARTNER_STATUS_CONFIG) as PartnerStatus[];
const PROVINCES = Object.keys(PROVINCE_LABELS) as ProvinceCode[];

export const PARTNER_TYPE_OPTIONS: SelectOption<PartnerType>[] = PARTNER_TYPES.map((type) =>
  linkedOption(type, () => PARTNER_TYPE_CONFIG[type].filterLabel),
);

export const PROVINCE_OPTIONS: SelectOption<ProvinceCode>[] = PROVINCES.map((province) =>
  linkedOption(province, () => PROVINCE_LABELS[province]),
);

export const PARTNER_STATUS_FILTER_OPTIONS: SelectOption<PartnerFilters['status']>[] = [
  localizedOption('all', 'filters.allStatuses', 'Tất cả trạng thái'),
  ...PARTNER_STATUSES.map((status) =>
    linkedOption(status, () => PARTNER_STATUS_CONFIG[status].filterLabel),
  ),
];

export const DEFAULT_PARTNER_FILTERS: PartnerFilters = {
  keyword: '',
  status: 'all',
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/** Lý do khóa tài khoản đối tác — key bản dịch, hiển thị bằng t(key) */
export const PARTNER_LOCK_REASONS = [
  'partners.lockReasons.qualityViolation',
  'partners.lockReasons.unresolvedComplaints',
  'partners.lockReasons.expiredLicense',
  'partners.lockReasons.partnerRequest',
  'partners.lockReasons.other',
] as const satisfies readonly TranslationKey[];

/** Lý do "Khác" — bắt buộc nhập ghi chú chi tiết */
export const PARTNER_LOCK_OTHER_REASON = 'partners.lockReasons.other';

/** Lý do tạm ẩn gắn cho các địa điểm khi đối tác bị khóa (để mở lại đúng các địa điểm này) — mã dữ liệu, không dịch */
export const PARTNER_LOCK_HIDDEN_REASON = 'Tài khoản đối tác bị tạm khóa';

/** Trạng thái địa điểm của đối tác (cột "Địa điểm" ở danh sách, thẻ hồ sơ) */
export const PARTNER_PLACE_STATUS_CONFIG: Record<
  PartnerPlaceStatus,
  { labelKey: TranslationKey; icon: string; className: string }
> = {
  none: {
    labelKey: 'partners.place.none',
    icon: 'add_location_alt',
    className: 'bg-surface-container text-on-surface-variant',
  },
  pending: {
    labelKey: 'partners.place.pending',
    icon: 'pending',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  approved: {
    labelKey: 'partners.place.approved',
    icon: 'check_circle',
    className: 'bg-secondary-container text-on-secondary-container',
  },
  hidden: {
    labelKey: 'partners.place.hidden',
    icon: 'visibility_off',
    className: 'bg-surface-container-high text-on-surface',
  },
  rejected: {
    labelKey: 'partners.place.rejected',
    icon: 'cancel',
    className: 'bg-error-container text-on-error-container',
  },
};
