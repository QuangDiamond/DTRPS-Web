import type {
  PartnerFilters,
  PartnerSortOption,
  PartnerStatus,
  PartnerType,
  ProvinceCode,
  SelectOption,
} from '../types/admin';

interface PartnerTypeConfig {
  label: string;
  filterLabel: string;
  icon: string;
  /** Icon mặc định cho cơ sở khi tạo đối tác mới */
  defaultBusinessIcon: string;
  badgeClass: string;
  avatarClass: string;
}

export const PARTNER_TYPE_CONFIG: Record<PartnerType, PartnerTypeConfig> = {
  hotel: {
    label: 'Khách sạn',
    filterLabel: 'Khách sạn / Homestay',
    icon: 'bed',
    defaultBusinessIcon: 'cottage',
    badgeClass: 'bg-secondary-container/60 text-on-secondary-container',
    avatarClass: 'bg-secondary-container text-on-secondary-container',
  },
  fnb: {
    label: 'Nhà hàng F&B',
    filterLabel: 'Nhà hàng / F&B',
    icon: 'dinner_dining',
    defaultBusinessIcon: 'restaurant',
    badgeClass: 'bg-tertiary-fixed/70 text-on-tertiary-fixed',
    avatarClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  attraction: {
    label: 'Điểm tham quan',
    filterLabel: 'Điểm tham quan',
    icon: 'attractions',
    defaultBusinessIcon: 'attractions',
    badgeClass: 'bg-surface-container-high text-primary',
    avatarClass: 'bg-surface-container-high text-primary',
  },
  tour: {
    label: 'Tour & Trải nghiệm',
    filterLabel: 'Tour trải nghiệm',
    icon: 'kayaking',
    defaultBusinessIcon: 'explore',
    badgeClass: 'bg-surface-container-highest text-on-surface',
    avatarClass: 'bg-surface-container-highest text-on-surface',
  },
};

export const SUSPENDED_AVATAR_CLASS = 'bg-error-container/60 text-on-error-container';

interface PartnerStatusConfig {
  label: string;
  filterLabel: string;
  badgeClass: string;
  dotClass: string;
}

export const PARTNER_STATUS_CONFIG: Record<PartnerStatus, PartnerStatusConfig> = {
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
};

export const PROVINCE_LABELS: Record<ProvinceCode, string> = {
  quangnam: 'Quảng Nam (Hội An)',
  danang: 'Đà Nẵng',
  hanoi: 'Hà Nội',
  hcm: 'TP. Hồ Chí Minh',
  kiengiang: 'Kiên Giang (Phú Quốc)',
  ninhbinh: 'Ninh Bình',
  quangngai: 'Quảng Ngãi',
  thanhhoa: 'Thanh Hóa (Sầm Sơn)',
};

/** Tên tỉnh ngắn gọn để hiển thị trong bảng */
export const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  quangnam: 'Quảng Nam',
  danang: 'Đà Nẵng',
  hanoi: 'Hà Nội',
  hcm: 'TP. Hồ Chí Minh',
  kiengiang: 'Kiên Giang',
  ninhbinh: 'Ninh Bình',
  quangngai: 'Quảng Ngãi',
  thanhhoa: 'Thanh Hóa',
};

export const PARTNER_SORT_LABELS: Record<PartnerSortOption, string> = {
  newest: 'Mới nhất đăng ký',
  listings: 'Nhiều địa điểm niêm yết nhất',
  rating: 'Đánh giá cao nhất',
};

const PARTNER_TYPES = Object.keys(PARTNER_TYPE_CONFIG) as PartnerType[];
const PARTNER_STATUSES = Object.keys(PARTNER_STATUS_CONFIG) as PartnerStatus[];
const PROVINCES = Object.keys(PROVINCE_LABELS) as ProvinceCode[];
const SORT_OPTIONS = Object.keys(PARTNER_SORT_LABELS) as PartnerSortOption[];

export const PARTNER_TYPE_OPTIONS: SelectOption<PartnerType>[] = PARTNER_TYPES.map((type) => ({
  value: type,
  label: PARTNER_TYPE_CONFIG[type].filterLabel,
}));

export const PROVINCE_OPTIONS: SelectOption<ProvinceCode>[] = PROVINCES.map((province) => ({
  value: province,
  label: PROVINCE_LABELS[province],
}));

export const PARTNER_TYPE_FILTER_OPTIONS: SelectOption<PartnerFilters['type']>[] = [
  { value: 'all', label: 'Tất cả loại hình' },
  ...PARTNER_TYPE_OPTIONS,
];

export const PARTNER_STATUS_FILTER_OPTIONS: SelectOption<PartnerFilters['status']>[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...PARTNER_STATUSES.map((status) => ({
    value: status,
    label: PARTNER_STATUS_CONFIG[status].filterLabel,
  })),
];

export const PROVINCE_FILTER_OPTIONS: SelectOption<PartnerFilters['province']>[] = [
  { value: 'all', label: 'Toàn quốc (63 Tỉnh/TP)' },
  ...PROVINCE_OPTIONS,
];

export const PARTNER_SORT_OPTIONS: SelectOption<PartnerSortOption>[] = SORT_OPTIONS.map((sort) => ({
  value: sort,
  label: PARTNER_SORT_LABELS[sort],
}));

export const DEFAULT_PARTNER_FILTERS: PartnerFilters = {
  keyword: '',
  type: 'all',
  status: 'all',
  province: 'all',
  sort: 'newest',
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

/** Lý do khóa tài khoản đối tác */
export const PARTNER_LOCK_REASONS = [
  'Vi phạm chính sách tiêu chuẩn chất lượng dịch vụ du lịch',
  'Có khiếu nại chưa xử lý từ du khách',
  'Giấy phép kinh doanh / PCCC hết hiệu lực',
  'Theo yêu cầu tạm dừng của đối tác',
  'Khác (Ghi chú chi tiết)',
];

/** Lý do tạm ẩn gắn cho các địa điểm khi đối tác bị khóa (để mở lại đúng các địa điểm này) */
export const PARTNER_LOCK_HIDDEN_REASON = 'Tài khoản đối tác bị tạm khóa';
