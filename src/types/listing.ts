/** Niêm yết */
import type { PartnerType, ProvinceCode } from './partner';

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
  /** Đã index vector (pgvector) — niêm yết mới được tìm thấy bằng tìm kiếm AI */
  vectorEmbedded: boolean;
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
  /** Lượt tương tác với niêm yết trong 7 ngày */
  weeklyEngagements: number;
  /** % tăng trưởng lượt tương tác so với tuần trước */
  weeklyEngagementGrowth: number;
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

export interface RejectOptions {
  /** Góp ý & hướng dẫn sửa đổi gửi cho đối tác */
  feedback?: string;
  /** Ghi chú kiểm duyệt nội bộ */
  note?: string;
  /** Nhóm lý do (phục vụ lọc ở màn Địa điểm bị từ chối) */
  reasonCode?: RejectionReasonCode;
}

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

export interface ReviewLogEntry {
  id: string;
  /** ISO datetime */
  time: string;
  text: string;
  tone: 'primary' | 'muted' | 'error';
}
