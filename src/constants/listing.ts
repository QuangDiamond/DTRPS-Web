import type {
  ListingCategory,
  ListingFilters,
  ListingPriority,
  ApprovedListingFilters,
  ApprovedSortOption,
  ListingStatus,
  ListingVisibility,
  PartnerTier,
  ProvinceCode,
  RejectedListingFilters,
  RejectionReasonCode,
  ResubmissionStatus,
  SelectOption,
} from '../types/admin';
import { PROVINCE_LABELS } from './partner';

// ===== Danh mục =====
interface ListingCategoryConfig {
  /** Icon mặc định khi gán danh mục / thêm thủ công */
  defaultIcon: string;
  /** Nhãn ngắn (bảng ở Bảng điều khiển) */
  label: string;
  /** Nhãn trong bộ lọc */
  filterLabel: string;
  /** Badge ngắn (bảng ở Bảng điều khiển) */
  badgeClass: string;
  /** Badge bo tròn (bảng Quản lý niêm yết) */
  pillClass: string;
  /** Ô icon cơ sở */
  iconBoxClass: string;
}

export const LISTING_CATEGORY_CONFIG: Record<ListingCategory, ListingCategoryConfig> = {
  hotel: {
    defaultIcon: 'cottage',
    label: 'Khách sạn',
    filterLabel: 'Khách sạn / Homestay',
    badgeClass: 'bg-secondary-container/60 text-on-secondary-container',
    pillClass: 'bg-secondary-container text-on-secondary-container',
    iconBoxClass: 'bg-secondary-container/40 text-primary',
  },
  fnb: {
    defaultIcon: 'restaurant',
    label: 'Ẩm thực',
    filterLabel: 'Nhà hàng / Ẩm thực',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    pillClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    iconBoxClass: 'bg-tertiary-fixed/60 text-tertiary',
  },
  attraction: {
    defaultIcon: 'attractions',
    label: 'Tham quan',
    filterLabel: 'Điểm tham quan / Di tích',
    badgeClass: 'bg-surface-container-highest text-on-surface',
    pillClass: 'bg-surface-container-high text-on-surface',
    iconBoxClass: 'bg-surface-container-high text-primary',
  },
  tour: {
    defaultIcon: 'tour',
    label: 'Tour',
    filterLabel: 'Trải nghiệm & Tour',
    badgeClass: 'bg-surface-container-high text-primary',
    pillClass: 'bg-primary-fixed text-on-primary-fixed',
    iconBoxClass: 'bg-surface-container-high text-primary',
  },
  shopping: {
    defaultIcon: 'shopping_bag',
    label: 'Mua sắm',
    filterLabel: 'Mua sắm đặc sản',
    badgeClass: 'bg-error-container/60 text-on-error-container',
    pillClass: 'bg-error-container/60 text-on-error-container',
    iconBoxClass: 'bg-error-container/40 text-error',
  },
};

const LISTING_CATEGORIES = Object.keys(LISTING_CATEGORY_CONFIG) as ListingCategory[];

/** Bộ lọc gọn (Bảng điều khiển) */
export const LISTING_CATEGORY_FILTER_OPTIONS: SelectOption<ListingCategory | 'all'>[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  ...LISTING_CATEGORIES.map((category) => ({
    value: category,
    label: LISTING_CATEGORY_CONFIG[category].label,
  })),
];

/** Bộ lọc đầy đủ (Quản lý niêm yết) */
export const LISTING_CATEGORY_SELECT_OPTIONS: SelectOption<ListingCategory | 'all'>[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  ...LISTING_CATEGORIES.map((category) => ({
    value: category,
    label: LISTING_CATEGORY_CONFIG[category].filterLabel,
  })),
];

// ===== Trạng thái =====
interface ListingStatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const LISTING_STATUS_CONFIG: Record<ListingStatus, ListingStatusConfig> = {
  pending: {
    label: 'Chờ duyệt',
    badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    dotClass: 'bg-tertiary animate-pulse',
  },
  approved: {
    label: 'Đã duyệt',
    badgeClass: 'bg-secondary-container text-on-secondary-container',
    dotClass: 'bg-primary',
  },
  rejected: {
    label: 'Từ chối',
    badgeClass: 'bg-error-container text-on-error-container',
    dotClass: 'bg-error',
  },
};

// ===== Hạng đối tác =====
export const PARTNER_TIER_CONFIG: Record<PartnerTier, { label: string; className: string }> = {
  diamond: { label: 'Đối tác Diamond', className: 'font-medium text-primary' },
  individual: { label: 'Hộ kinh doanh cá thể', className: 'text-on-surface-variant' },
  gold: { label: 'Đối tác Gold', className: 'font-medium text-tertiary' },
  verified: { label: 'Đối tác Xác thực', className: 'text-on-surface-variant' },
  new: { label: 'Đối tác Mới', className: 'text-on-surface-variant' },
  public: { label: 'Tổ chức Công', className: 'font-medium text-primary' },
};

export const PARTNER_TIER_OPTIONS: SelectOption<PartnerTier | 'all'>[] = [
  { value: 'all', label: 'Tất cả đối tác' },
  { value: 'diamond', label: 'Đối tác Diamond' },
  { value: 'gold', label: 'Đối tác Chiến lược (Gold)' },
  { value: 'verified', label: 'Đối tác Xác thực' },
  { value: 'new', label: 'Đối tác Mới đăng ký' },
  { value: 'public', label: 'Tổ chức Công' },
  { value: 'individual', label: 'Hộ kinh doanh cá thể' },
];

/** Badge hạng đối tác trong bảng Địa điểm đã duyệt (null = chỉ hiện dòng chữ) */
export const PARTNER_TIER_BADGE: Record<
  PartnerTier,
  { label: string; icon?: string; className?: string }
> = {
  diamond: {
    label: 'Đối tác Diamond',
    icon: 'diamond',
    className: 'bg-primary-fixed text-on-primary-fixed-variant',
  },
  gold: {
    label: 'Đối tác Gold',
    icon: 'hotel_class',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  verified: {
    label: 'Đã xác thực',
    icon: 'verified',
    className: 'bg-secondary-container/70 text-on-secondary-container',
  },
  public: {
    label: 'Tổ chức Công',
    icon: 'account_balance',
    className: 'bg-surface-container-high text-primary',
  },
  new: {
    label: 'Đối tác mới',
    icon: 'new_releases',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  individual: { label: 'Đã xác minh CCCD' },
};

// ===== Tỉnh thành & mức độ ưu tiên =====
export const LISTING_PROVINCE_OPTIONS: SelectOption<ProvinceCode | 'all'>[] = [
  { value: 'all', label: 'Toàn quốc (Tỉnh/Thành)' },
  ...(['quangnam', 'danang', 'hanoi', 'ninhbinh', 'kiengiang'] as ProvinceCode[]).map(
    (province) => ({ value: province, label: PROVINCE_LABELS[province] }),
  ),
];

export const LISTING_PRIORITY_OPTIONS: SelectOption<ListingPriority>[] = [
  { value: 'all', label: 'Tất cả mức độ' },
  { value: 'overdue', label: 'Chờ quá 24h (Khẩn)' },
  { value: 'medium', label: 'Chờ từ 2 - 12h' },
  { value: 'today', label: 'Mới gửi hôm nay' },
];

export const DEFAULT_LISTING_FILTERS: ListingFilters = {
  keyword: '',
  category: 'all',
  province: 'all',
  tier: 'all',
  priority: 'all',
};

/** Hồ sơ chờ quá số giờ này bị coi là quá hạn */
export const LISTING_OVERDUE_HOURS = 24;

export const LISTING_PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

// ===== Thẩm định =====
export const QUICK_REJECT_REASONS = [
  'Thiếu giấy phép kinh doanh',
  'Thiếu giấy phép ATVSTP',
  'Hình ảnh mờ / không đúng thực tế',
  'Thông tin địa chỉ không chính xác',
];

/** Checklist kiểm định chuẩn — dùng cho hồ sơ không có dữ liệu chi tiết */
export const DEFAULT_REVIEW_CHECKLIST = [
  { id: 'gps', label: 'Tọa độ GPS hợp lệ' },
  { id: 'zoning', label: 'Vị trí quy hoạch du lịch' },
  { id: 'photos', label: 'Ảnh đạt độ phân giải chuẩn' },
  { id: 'license', label: 'Giấy phép còn hiệu lực' },
];

/** Trạng thái hiển thị trên banner màn Xem xét & Duyệt */
export const REVIEW_STATUS_BANNER: Record<
  ListingStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: 'Chờ duyệt',
    badgeClass: 'border-tertiary-fixed bg-tertiary-fixed/60 text-on-tertiary-fixed',
    dotClass: 'animate-pulse bg-tertiary-container',
  },
  approved: {
    label: 'Đã phê duyệt',
    badgeClass:
      'border-secondary-fixed-dim/50 bg-secondary-container/60 text-on-secondary-fixed-variant',
    dotClass: 'bg-secondary',
  },
  rejected: {
    label: 'Đã từ chối',
    badgeClass: 'border-error-container bg-error-container/70 text-on-error-container',
    dotClass: 'bg-error',
  },
};

export const REVIEW_POLICIES = [
  {
    icon: 'gavel',
    title: 'Pháp lý bắt buộc',
    description:
      'Mọi cơ sở phải có giấy phép kinh doanh còn hiệu lực. Lưu trú cần thêm giấy chứng nhận PCCC; ẩm thực cần giấy ATVSTP.',
  },
  {
    icon: 'photo_library',
    title: 'Hình ảnh & nội dung',
    description:
      'Tối thiểu 5 ảnh thật, độ phân giải HD, không chèn logo bên thứ ba. Mô tả trung thực, không phóng đại dịch vụ.',
  },
  {
    icon: 'schedule',
    title: 'Thời hạn xử lý',
    description:
      'Hồ sơ phải được thẩm định trong 24 giờ kể từ khi gửi. Hồ sơ quá hạn được đánh dấu "Khẩn" và ưu tiên xử lý.',
  },
  {
    icon: 'report',
    title: 'Từ chối hồ sơ',
    description:
      'Bắt buộc ghi rõ lý do từ chối để đối tác bổ sung. Đối tác được gửi lại hồ sơ sau khi khắc phục.',
  },
];

// ===== Lý do từ chối (modal Từ chối niêm yết) =====
export interface RejectionReason {
  id: RejectionReasonCode;
  title: string;
  /** Nhãn ngắn trong bộ lọc */
  shortLabel: string;
  icon: string;
  /** Màu chữ + icon trong bảng Địa điểm bị từ chối */
  toneClass: string;
  description?: string;
  /** Câu dùng trong văn bản mẫu gửi đối tác */
  templateCause: string;
  /** Hướng dẫn khắc phục trong văn bản mẫu */
  templateFix: string;
}

export const REJECTION_REASONS: RejectionReason[] = [
  {
    id: 'legal',
    shortLabel: 'Thiếu chứng nhận PCCC / ATTP',
    icon: 'local_fire_department',
    toneClass: 'text-error',
    title: 'Không đủ tài liệu chứng minh pháp lý (Giấy phép ATTP / PCCC hết hạn hoặc không hợp lệ)',
    description: 'Giấy phép đã hết hạn hoặc thiếu văn bản gia hạn, không đối chiếu được với CSDL.',
    templateCause: 'giấy phép pháp lý (ATTP / PCCC) đã hết hạn hoặc chưa hợp lệ',
    templateFix: 'cập nhật bản scan công chứng mới còn hiệu lực',
  },
  {
    id: 'pricing',
    shortLabel: 'Sai thông tin đăng ký kinh doanh',
    icon: 'description',
    toneClass: 'text-error',
    title: 'Thông tin kinh doanh không chính xác hoặc sai lệch giá niêm yết thực tế',
    description: 'Chênh lệch bảng giá công bố và giá đặt phòng qua hệ thống du lịch.',
    templateCause: 'thông tin kinh doanh và bảng giá niêm yết chưa khớp với thực tế',
    templateFix: 'rà soát và cập nhật lại bảng giá, thông tin dịch vụ chính xác',
  },
  {
    id: 'location',
    shortLabel: 'Tọa độ GPS sai lệch',
    icon: 'wrong_location',
    toneClass: 'text-tertiary',
    title: 'Vị trí địa lý không hợp lệ / Sai lệch tọa độ GPS (> 30m)',
    description: 'Tọa độ pin trên bản đồ lệch xa so với địa chỉ đăng ký kinh doanh.',
    templateCause: 'tọa độ GPS trên bản đồ lệch so với địa chỉ đăng ký kinh doanh',
    templateFix: 'ghim lại vị trí chính xác của cơ sở trên bản đồ',
  },
  {
    id: 'photos',
    shortLabel: 'Ảnh kém chất lượng / dính Watermark',
    icon: 'broken_image',
    toneClass: 'text-on-surface-variant',
    title: 'Hình ảnh chất lượng kém / dính watermark / không rõ nét',
    description: 'Ảnh mặt tiền hoặc biển hiệu vi phạm tiêu chuẩn độ phân giải tối thiểu 1080p.',
    templateCause:
      'hình ảnh mặt tiền / biển hiệu chưa đạt chuẩn chất lượng (mờ hoặc dính watermark)',
    templateFix: 'chụp lại ảnh thực tế rõ nét, độ phân giải tối thiểu 1080p',
  },
  {
    id: 'duplicate',
    shortLabel: 'Trùng lặp địa điểm',
    icon: 'content_copy',
    toneClass: 'text-on-surface-variant',
    title: 'Trùng lặp địa điểm đã tồn tại trên hệ thống',
    description: 'Đã có POI cùng tên và cùng vị trí được quản lý bởi đối tác khác.',
    templateCause: 'địa điểm trùng với một POI đã tồn tại trên hệ thống',
    templateFix: 'cung cấp giấy tờ chứng minh quyền quản lý hoặc liên hệ bộ phận hỗ trợ đối tác',
  },
  {
    id: 'other',
    shortLabel: 'Lý do khác',
    icon: 'info',
    toneClass: 'text-on-surface-variant',
    title: 'Lý do khác (Chi tiết ở phần góp ý bên dưới)',
    templateCause: 'chưa đáp ứng quy chế kiểm duyệt niêm yết',
    templateFix: 'bổ sung các nội dung theo góp ý chi tiết',
  },
];

export const MAX_FEEDBACK_LENGTH = 500;

// ===== Địa điểm đã duyệt =====
export const VISIBILITY_FILTER_OPTIONS: SelectOption<ListingVisibility | 'all'>[] = [
  { value: 'all', label: 'Trạng thái: Tất cả' },
  { value: 'visible', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Tạm ẩn' },
];

export const APPROVED_SORT_OPTIONS: SelectOption<ApprovedSortOption>[] = [
  { value: 'recent', label: 'Mới duyệt gần đây' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'views', label: 'Lượt xem nhiều nhất' },
];

export const MIN_RATING_OPTIONS: SelectOption<string>[] = [
  { value: '0', label: 'Mọi mức đánh giá' },
  { value: '4.5', label: 'Từ 4.5 sao' },
  { value: '4', label: 'Từ 4.0 sao' },
  { value: '3.5', label: 'Từ 3.5 sao' },
];

export const DEFAULT_APPROVED_FILTERS: ApprovedListingFilters = {
  keyword: '',
  category: 'all',
  province: 'all',
  visibility: 'all',
  sort: 'recent',
  tier: 'all',
  minRating: 0,
};

/** Lý do tạm ẩn hay dùng */
export const HIDE_REASONS = [
  'Sửa chữa mặt bằng',
  'Tạm ngưng kinh doanh theo mùa',
  'Theo yêu cầu của đối tác',
  'Đang xác minh phản ánh của du khách',
];

// ===== Địa điểm bị từ chối =====
/** Số ngày đối tác được bổ sung & gửi lại hồ sơ sau khi bị từ chối */
export const RESUBMIT_WINDOW_DAYS = 7;

export const REJECTION_REASON_FILTER_OPTIONS: SelectOption<RejectionReasonCode | 'all'>[] = [
  { value: 'all', label: 'Tất cả lý do từ chối' },
  ...REJECTION_REASONS.map((reason) => ({ value: reason.id, label: reason.shortLabel })),
];

export const RESUBMISSION_CONFIG: Record<
  ResubmissionStatus,
  { filterLabel: string; icon: string; badgeClass: string }
> = {
  resubmitted: {
    filterLabel: 'Đã gửi lại hồ sơ (Mới)',
    icon: 'refresh',
    badgeClass: 'bg-secondary-container font-semibold text-on-secondary-container',
  },
  waiting: {
    filterLabel: 'Chưa gửi lại (Trong hạn)',
    icon: 'hourglass_top',
    badgeClass: 'bg-surface-container-high font-medium text-on-surface-variant',
  },
  overdue: {
    filterLabel: 'Quá hạn bổ sung',
    icon: 'alarm_off',
    badgeClass: 'bg-error-container/70 font-semibold text-on-error-container',
  },
  locked: {
    filterLabel: 'Đã khóa vĩnh viễn',
    icon: 'lock',
    badgeClass: 'bg-surface-variant font-semibold text-on-surface-variant',
  },
};

export const RESUBMISSION_FILTER_OPTIONS: SelectOption<ResubmissionStatus | 'all'>[] = [
  { value: 'all', label: 'Trạng thái gửi lại' },
  ...(Object.keys(RESUBMISSION_CONFIG) as ResubmissionStatus[]).map((status) => ({
    value: status,
    label: RESUBMISSION_CONFIG[status].filterLabel,
  })),
];

export const REJECTED_PROVINCE_OPTIONS: SelectOption<ProvinceCode | 'all'>[] = [
  { value: 'all', label: 'Tỉnh/Thành phố' },
  ...(['danang', 'quangnam', 'thanhhoa', 'quangngai', 'hanoi', 'kiengiang'] as ProvinceCode[]).map(
    (province) => ({ value: province, label: PROVINCE_LABELS[province] }),
  ),
];

export const DEFAULT_REJECTED_FILTERS: RejectedListingFilters = {
  keyword: '',
  reasonCode: 'all',
  resubmission: 'all',
  province: 'all',
};
