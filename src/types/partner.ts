/** Đối tác (Partners) */

/** Loại hình đối tác = nhóm địa điểm: Lưu trú / Ẩm thực / Vui chơi & Tham quan / Mua sắm & Đặc sản */
export type PartnerType = 'hotel' | 'fnb' | 'attraction' | 'shopping';

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
  /** Số lần địa điểm của đối tác xuất hiện trong kết quả tìm kiếm AI */
  aiSearchHits: number;
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
  };
  certifications: PartnerCertification[];
  ratings: PartnerRatingSummary;
  /** ISO date */
  nextReviewDate: string;
  /** Thỏa thuận hợp tác đăng địa điểm (không phát sinh hoa hồng / thanh toán qua nền tảng) */
  agreement: {
    type: string;
    /** ISO date */
    activatedAt: string;
    /** ISO date */
    renewAt: string;
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

/** Các giá trị hồ sơ admin chỉnh được ở màn Chi tiết đối tác */
export interface PartnerProfileOverrides {
  nextReviewDate?: string;
}

export interface PartnerReview {
  id: string;
  author: string;
  rating: number;
  /** Nội dung do du khách viết — dữ liệu, không dịch */
  comment: string;
  /** ISO datetime */
  date: string;
  listingName: string;
}

export interface PartnerRatingSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  recent: PartnerReview[];
}
