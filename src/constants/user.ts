import type {
  SelectOption,
  UserAccountType,
  UserFilters,
  UserJoinedRange,
  UserStatus,
} from '../types/admin';

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; filterLabel: string; badgeClass: string; dotClass: string }
> = {
  active: {
    label: 'Hoạt động (Active)',
    filterLabel: 'Đang hoạt động',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    dotClass: 'bg-primary',
  },
  suspended: {
    label: 'Tạm khóa (Suspended)',
    filterLabel: 'Đang khóa / Tạm đình chỉ',
    badgeClass: 'bg-error-container text-on-error-container',
    dotClass: 'bg-error',
  },
};

export const USER_ACCOUNT_TYPE_LABELS: Record<UserAccountType, string> = {
  standard: 'Thành viên Tiêu chuẩn',
  vip: 'VIP Travel Member',
  partner: 'Đối tác liên kết',
};

export const USER_STATUS_OPTIONS: SelectOption<UserStatus | 'all'>[] = [
  { value: 'all', label: 'Trạng thái: Tất cả' },
  { value: 'active', label: USER_STATUS_CONFIG.active.filterLabel },
  { value: 'suspended', label: USER_STATUS_CONFIG.suspended.filterLabel },
];

export const USER_ACCOUNT_TYPE_OPTIONS: SelectOption<UserAccountType | 'all'>[] = [
  { value: 'all', label: 'Loại tài khoản: Tất cả' },
  ...(Object.keys(USER_ACCOUNT_TYPE_LABELS) as UserAccountType[]).map((type) => ({
    value: type,
    label: USER_ACCOUNT_TYPE_LABELS[type],
  })),
];

export const USER_JOINED_OPTIONS: SelectOption<UserJoinedRange>[] = [
  { value: 'all', label: 'Ngày đăng ký: Tất cả' },
  { value: '30days', label: '30 ngày qua' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: '12 tháng qua' },
];

export const DEFAULT_USER_FILTERS: UserFilters = {
  keyword: '',
  status: 'all',
  accountType: 'all',
  joined: 'all',
};

export const USER_LOCK_REASONS = [
  'Vi phạm spam review',
  'Đăng nội dung không phù hợp',
  'Gian lận khuyến mãi / đặt chỗ ảo',
  'Nghi ngờ tài khoản bị chiếm đoạt',
  'Theo yêu cầu của người dùng',
];

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
