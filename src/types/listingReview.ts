/**
 * Duyệt địa điểm của đối tác — dữ liệu thật từ /api/admin/business-listings và /api/admin/listing-revisions.
 * (Khác với types/listing.ts là dữ liệu mẫu dùng cho Bảng điều khiển / Báo cáo.)
 */

export interface RefItem {
  code: string;
  name: string;
}

/** dayOfWeek: 1 = Thứ 2 … 7 = Chủ nhật; giờ dạng HH:mm, null khi đóng cửa */
export interface OpeningHour {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  closed: boolean;
}

export interface PlacePrice {
  priceType: string;
  amount: number;
  currency: string;
  description: string | null;
}

export interface PlaceImage {
  url: string;
  /** Ảnh bìa */
  primary: boolean;
}

/** Nội dung một địa điểm (bản đang công khai hoặc bản đề xuất) */
export interface PlaceContent {
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  group: RefItem | null;
  category: RefItem | null;
  province: RefItem | null;
  phone: string | null;
  website: string | null;
  openingHours: OpeningHour[];
  prices: PlacePrice[];
  images: PlaceImage[];
}

/** pending → (duyệt) approved | (từ chối) rejected → (đối tác sửa) pending; suspended = tạm ẩn */
export type ReviewListingStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface ReviewListing extends PlaceContent {
  id: string;
  businessId: string;
  businessName: string;
  /** DRAFT khi chưa duyệt, ACTIVE khi đang công khai */
  placeStatus: string;
  status: ReviewListingStatus;
  /** Lý do từ chối (khi rejected) */
  statusNote?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** cancelled = đối tác đã rút lại */
export type RevisionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type RevisionRejectCode = 'pricing' | 'location' | 'photos' | 'duplicate' | 'other';

export interface ListingRevision {
  id: string;
  listingId: string;
  businessName: string;
  status: RevisionStatus;
  proposed: PlaceContent;
  rejectReasonCode?: RevisionRejectCode;
  /** Góp ý gửi đối tác */
  partnerFeedback?: string;
  /** Ghi chú nội bộ của admin */
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

/** Bản đề xuất đặt cạnh bản đang công khai */
export interface RevisionDetail {
  revision: ListingRevision;
  current: ReviewListing;
}

export interface ListingReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  pendingRevisions: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
