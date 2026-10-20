// ===== Chung =====
export interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export type Language = 'vi' | 'en';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

// ===== Đối tác (Partners) =====
export type PartnerType = 'hotel' | 'fnb' | 'attraction' | 'tour';

export type PartnerStatus = 'active' | 'pending' | 'suspended';

export type ProvinceCode =
  'quangnam' | 'danang' | 'hanoi' | 'hcm' | 'kiengiang' | 'ninhbinh' | 'quangngai' | 'thanhhoa';

export type PartnerSortOption = 'newest' | 'listings' | 'rating';

export interface PartnerListingSummary {
  total: number;
  approved: number;
  pending: number;
  paused: number;
}

export interface Partner {
  id: string;
  /** Tên doanh nghiệp đối tác */
  name: string;
  /** Tên cơ sở đại diện */
  businessName: string;
  /** Material Symbol hiển thị cạnh tên cơ sở */
  businessIcon: string;
  address: string;
  province: ProvinceCode;
  representative: string;
  type: PartnerType;
  email: string;
  phone: string;
  taxCode: string;
  listings: PartnerListingSummary;
  /** ISO date: YYYY-MM-DD */
  joinedAt: string;
  status: PartnerStatus;
  /** Ghi chú hiển thị dưới badge trạng thái, ví dụ "Giấy phép hết hạn" */
  statusNote?: string;
  rating: number;
}

export interface PartnerFilters {
  keyword: string;
  type: PartnerType | 'all';
  status: PartnerStatus | 'all';
  province: ProvinceCode | 'all';
  sort: PartnerSortOption;
}

export type PartnerFormValues = Pick<
  Partner,
  | 'name'
  | 'businessName'
  | 'type'
  | 'province'
  | 'address'
  | 'representative'
  | 'email'
  | 'phone'
  | 'taxCode'
>;

export interface PartnerStats {
  total: number;
  newThisMonth: number;
  lodging: number;
  culinary: number;
  experiences: number;
}

// ----- Hồ sơ chi tiết đối tác (màn Chi tiết đối tác) -----
export interface PartnerCertification {
  icon: string;
  title: string;
  meta: string;
  statusLabel: string;
  tone: 'valid' | 'trust' | 'warning';
}

export interface PartnerProfile {
  tierLabel: string;
  trustScore: number;
  trustLabel: string;
  /** Ví dụ "Đã đối soát cấp Bộ" */
  verificationLevel: string;
  /** Cơ quan cấp MST, ví dụ "Sở KH&ĐT Quảng Nam" */
  taxIssuer: string;
  /** Lượt lưu vào lịch trình AI */
  aiSaves: number;
  legal: {
    fullName: string;
    /** ISO date */
    foundedAt: string;
    issuer: string;
    charterCapital: number;
    headOffice: string;
    legalRepresentative: string;
    idNumberMasked: string;
    licenseFile: { name: string; size: string };
  };
  contact: {
    name: string;
    position: string;
    email: string;
    otpPhone: string;
    twoFactor: boolean;
    bank?: { name: string; account: string; currency: string };
    escrow: boolean;
  };
  certifications: PartnerCertification[];
  /** ISO date */
  nextReviewDate: string;
  agreement: {
    type: string;
    /** % hoa hồng hệ thống */
    commission: number;
    /** ISO date */
    activatedAt: string;
    /** ISO date */
    renewAt: string;
    paymentCycle: string;
    paymentMode: string;
    contractCode: string;
  };
}

export interface PartnerAuditEntry {
  id: string;
  /** ISO datetime */
  time: string;
  icon: string;
  text: string;
  actor: string;
}

// ===== Niêm yết =====
/** Danh mục niêm yết = loại hình đối tác + mua sắm đặc sản */
export type ListingCategory = PartnerType | 'shopping';

export type ListingStatus = 'pending' | 'approved' | 'rejected';

export type PartnerTier = 'diamond' | 'gold' | 'verified' | 'new' | 'public' | 'individual';

/** Trạng thái hiển thị của niêm yết đã duyệt */
export type ListingVisibility = 'visible' | 'hidden';

/** Lọc theo thời gian chờ */
export type ListingPriority = 'all' | 'overdue' | 'medium' | 'today';

export interface ListingHighlight {
  icon?: string;
  text: string;
  tone: 'primary' | 'tertiary' | 'muted';
}

export interface Listing {
  id: string;
  name: string;
  /** Icon thay thế khi không có / lỗi ảnh */
  icon: string;
  imageUrl?: string;
  /** Dòng phụ dưới tên, ví dụ "4.9 (Đánh giá sơ bộ)" */
  highlight?: ListingHighlight;
  partnerId?: string;
  partnerName: string;
  partnerTier: PartnerTier;
  category: ListingCategory;
  /** Nhãn chi tiết hiển thị trên badge, ví dụ "Nghỉ dưỡng ven biển" */
  categoryLabel: string;
  categoryIcon: string;
  address: string;
  province: ProvinceCode;
  /** ISO datetime */
  submittedAt: string;
  status: ListingStatus;
  rejectReason?: string;
  /** Góp ý chi tiết & hướng dẫn sửa đổi đã gửi cho đối tác khi từ chối */
  partnerFeedback?: string;
  /** Nhóm lý do từ chối (dùng để lọc & chọn icon) */
  rejectReasonCode?: RejectionReasonCode;
  /** Icon riêng cho lý do từ chối, mặc định lấy theo nhóm lý do */
  rejectIcon?: string;
  /** ISO datetime — đối tác đã gửi lại hồ sơ sau khi bị từ chối */
  resubmittedAt?: string;
  /** Hồ sơ bị từ chối đã bị đóng vĩnh viễn */
  locked?: boolean;
  /** Ghi chú kiểm duyệt nội bộ của admin */
  reviewNote?: string;
  /** ISO datetime */
  reviewedAt?: string;
  /** Chỉ áp dụng cho niêm yết đã duyệt (mặc định: visible) */
  visibility?: ListingVisibility;
  hiddenReason?: string;
  rating?: number;
  reviewCount?: number;
  views?: number;
}

// ----- Hồ sơ chi tiết dùng cho màn Xem xét & Duyệt -----
export interface ListingPhoto {
  url: string;
  caption: string;
  /** Ví dụ "3840 x 2160 px • WEBP" */
  meta?: string;
}

export interface ListingDocument {
  id: string;
  fileType: 'pdf' | 'image';
  title: string;
  meta: string;
  verified: boolean;
}

export interface ListingChecklistItem {
  id: string;
  label: string;
  passed: boolean;
}

export interface ListingFact {
  icon: string;
  label: string;
  value: string;
  note: string;
  tone: 'teal' | 'amber';
}

export interface ListingDetailLog {
  /** Số phút sau thời điểm nộp hồ sơ */
  minutesAfterSubmit: number;
  text: string;
}

export interface ListingDetail {
  /** Nhãn danh mục chi tiết, ví dụ "Khách sạn & Homestay (Lưu trú sinh thái)" */
  categoryDetail: string;
  reviewLevel: string;
  areaLabel: string;
  /** Độ hoàn thiện hồ sơ (%) */
  completeness: number;
  description: string;
  fullAddress: string;
  hotline: string;
  email: string;
  website?: string;
  schedule: { label: string; value: string };
  price?: { range: string; note: string };
  /** Ảnh đầu tiên là ảnh bìa */
  photos: ListingPhoto[];
  requiredPhotoCount: number;
  business: {
    scaleBadge: string;
    facts: ListingFact[];
    amenities: { icon: string; label: string }[];
    policyNote?: { title: string; text: string };
  };
  partner: {
    code: string;
    representative: string;
    hotline: string;
    yearsActive: string;
    approvedCount: number;
    responseRate: string;
    verified: boolean;
  };
  checklist: ListingChecklistItem[];
  location: {
    coordinates?: { lat: number; lng: number };
    mapImageUrl?: string;
    areaNote: string;
    accuracy?: string;
  };
  documents: ListingDocument[];
  logs: ListingDetailLog[];
  defaultNote: string;
}

export interface ListingFilters {
  keyword: string;
  category: ListingCategory | 'all';
  province: ProvinceCode | 'all';
  tier: PartnerTier | 'all';
  priority: ListingPriority;
}

/** Số liệu tổng hợp toàn hệ thống (gồm cả dữ liệu không có trong mock) */
export interface ListingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  /** Số niêm yết đã duyệt nhưng đang tạm ẩn */
  hidden: number;
  /** Hồ sơ bị từ chối mà đối tác đã gửi lại, chờ thẩm định lại */
  resubmitted: number;
  /** Hồ sơ bị từ chối đã đóng vĩnh viễn */
  locked: number;
}

export type RejectionReasonCode =
  'legal' | 'pricing' | 'location' | 'photos' | 'duplicate' | 'other';

/** Trạng thái gửi lại của hồ sơ bị từ chối */
export type ResubmissionStatus = 'resubmitted' | 'waiting' | 'overdue' | 'locked';

export interface RejectedListingFilters {
  keyword: string;
  reasonCode: RejectionReasonCode | 'all';
  resubmission: ResubmissionStatus | 'all';
  province: ProvinceCode | 'all';
}

export type ApprovedSortOption = 'recent' | 'rating' | 'views';

export interface ApprovedListingFilters {
  keyword: string;
  category: ListingCategory | 'all';
  province: ProvinceCode | 'all';
  visibility: ListingVisibility | 'all';
  sort: ApprovedSortOption;
  /** Bộ lọc nâng cao */
  tier: PartnerTier | 'all';
  minRating: number;
}

/** Thông tin admin nhập khi thêm thủ công / chỉnh sửa niêm yết */
export interface ListingFormValues {
  name: string;
  partnerName: string;
  category: ListingCategory;
  categoryLabel: string;
  address: string;
  province: ProvinceCode;
}

// ===== Bảng điều khiển =====

export type DashboardRange = 'today' | '7days' | '30days' | 'thisyear' | 'custom';

/** Khoảng ngày dạng ISO YYYY-MM-DD */
export interface DateRange {
  from: string;
  to: string;
}

export interface DashboardStats {
  totalUsers: number;
  userGrowthPercent: number;
  newUsers30Days: number;
  totalPartners: number;
  partnerGrowthPercent: number;
  newPartnersThisMonth: number;
  totalListings: number;
  provincesCovered: number;
  pendingReviews: number;
  avgWaitHours: number;
  approvedListings: number;
  rejectedListings: number;
}

export interface GrowthPoint {
  /** Nhãn trục X, ví dụ "Tháng 5" */
  label: string;
  /** Nhãn trong tooltip, ví dụ "Tháng 10 (Hiện tại)" */
  fullLabel: string;
  users: number;
  trips: number;
}

export interface CategoryShare {
  category: ListingCategory;
  label: string;
  count: number;
}

export type ActivityKind =
  'partner_registered' | 'listing_approved' | 'listing_rejected' | 'listing_submitted';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  /** Tên đối tác / địa điểm được nhắc tới */
  subject: string;
  reason?: string;
  /** ISO datetime */
  createdAt: string;
}

// ===== Người dùng (khách du lịch) =====
export type UserStatus = 'active' | 'suspended';

export type UserAccountType = 'standard' | 'vip' | 'partner';

export type UserJoinedRange = 'all' | '30days' | 'quarter' | 'year';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  /** ISO date */
  joinedAt: string;
  accountType: UserAccountType;
  status: UserStatus;
  tripCount: number;
  /** Dòng phụ dưới số chuyến đi, ví dụ "4 lịch trình AI" */
  tripNote: string;
  tripNoteIcon?: string;
  /** Lý do tạm khóa (hiển thị thay cho tripNote khi bị khóa) */
  suspendReason?: string;
  /** Màu avatar khi đang hoạt động */
  avatarTone: 'teal' | 'neutral';
}

export interface UserFilters {
  keyword: string;
  status: UserStatus | 'all';
  accountType: UserAccountType | 'all';
  joined: UserJoinedRange;
}

export type UserFormValues = Pick<AppUser, 'name' | 'email' | 'phone' | 'city' | 'accountType'>;

/** Số liệu toàn hệ thống (gồm cả dữ liệu không có trong mock) */
export interface UserStats {
  total: number;
  active: number;
  newThisMonth: number;
  newToday: number;
  suspended: number;
}

// ----- Hồ sơ chi tiết người dùng (màn Chi tiết người dùng) -----
export type TripStatus = 'upcoming' | 'completed' | 'cancelled';

export interface UserTrip {
  id: string;
  name: string;
  status: TripStatus;
  /** Ví dụ "3N2Đ" */
  durationLabel: string;
  icon: string;
  /** ISO date */
  startDate: string;
  /** ISO date */
  endDate: string;
  poiCount: number;
  travelers?: string;
  /** Kinh phí dự toán (sắp diễn ra) hoặc số tiền đã thanh toán */
  amount: number;
  aiPlanned?: boolean;
  /** Điểm người dùng đã đánh giá chuyến đi */
  rating?: number;
}

export interface UserProfile {
  tierLabel: string;
  address: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin: { time: string; device: string; ip: string };
  trustScore: number;
  trustTitle: string;
  trustNote: string;
  badge: string;
  tripSummary: { total: number; completed: number; upcoming: number };
  savedPois: number;
  savedNote: string;
  savedBreakdown: string;
  reviewCount: number;
  avgRating: number;
  reviewsNote: string;
  totalSpend: number;
  spendNote: string;
  trips: UserTrip[];
}

export interface UserAuditEntry {
  id: string;
  /** ISO datetime */
  time: string;
  icon: string;
  text: string;
}

// ===== Điểm đến POI =====
export type PoiCategory = 'heritage' | 'nature' | 'food' | 'resort' | 'stay' | 'craft' | 'tour';

/** Tab lọc nhanh trên màn danh sách POI */
export type PoiCategoryTab = 'all' | 'heritage' | 'food' | 'stay' | 'nature' | 'craft';

/** Nhóm thống kê trên thẻ KPI */
export type PoiKpiGroup = 'sights' | 'food' | 'stay' | 'tour';

export type PoiStatus = 'active' | 'maintenance' | 'paused' | 'draft';

export type PoiSource = 'gov' | 'ai' | 'authority' | 'partner' | 'system';

export type PoiProvince =
  | 'quang-nam'
  | 'da-nang'
  | 'ha-noi'
  | 'quang-ninh'
  | 'hcm'
  | 'lao-cai'
  | 'thua-thien-hue'
  | 'kien-giang';

export interface PoiPhoto {
  id: string;
  url: string;
  caption: string;
  /** Ví dụ "2560 × 1440 px • 1.8 MB" */
  meta?: string;
}

export interface Poi {
  id: string;
  name: string;
  category: PoiCategory;
  /** Nhãn danh mục hiển thị ở bảng, ví dụ "Di sản văn hóa UNESCO" */
  subCategory?: string;
  /** Dòng điểm nhấn dưới tên POI ở bảng, ví dụ "Khu bảo tồn di sản cấp quốc tế" */
  highlight?: string;
  highlightIcon?: string;
  /** Màu icon điểm nhấn, ví dụ "text-tertiary" */
  highlightIconClass?: string;
  /** Danh mục phụ / tag gợi ý AI, phân tách bằng dấu phẩy */
  tags: string;
  description: string;
  price: string;
  openingHours: string;
  suggestedDuration: string;
  /** Số giờ AI khuyến nghị */
  aiRecommendedHours: number;
  /** Giải thích cách AI tính thời lượng */
  aiDurationNote?: string;
  /** Ảnh vuông ở bảng danh sách; không có thì dùng ảnh bìa */
  thumbnailUrl?: string;
  cover?: PoiPhoto;
  gallery: PoiPhoto[];
  managingUnit: string;
  hotline: string;
  website: string;
  email: string;
  province: PoiProvince;
  address: string;
  latitude: number;
  longitude: number;
  mapImageUrl?: string;
  /** Bán kính cụm kết nối (mét) */
  clusterRadius: number;
  clusterPois: string[];
  peakSeason: string;
  idealTime: string;
  /** 0 - 100 */
  priorityScore: number;
  personas: string[];
  status: PoiStatus;
  source: PoiSource;
  /** Tên nguồn cụ thể, ví dụ "BQL Vịnh Hạ Long" */
  sourceLabel?: string;
  rating: number;
  reviewCount: number;
  /** ISO datetime */
  updatedAt: string;
  updatedBy: string;
}

/** Các trường do hệ thống quản lý, không sửa trên form */
export type PoiSystemField = 'id' | 'updatedAt' | 'updatedBy' | 'source' | 'sourceLabel' | 'rating' | 'reviewCount';

export type PoiFormValues = Omit<Poi, PoiSystemField>;

export interface PoiFilters {
  search: string;
  province: PoiProvince | 'all';
  status: PoiStatus | 'all';
  source: PoiSource | 'all';
}

export interface PoiStats {
  total: number;
  newThisMonth: number;
  available: number;
  byGroup: Record<PoiKpiGroup, number>;
  byTab: Record<PoiCategoryTab, number>;
}
