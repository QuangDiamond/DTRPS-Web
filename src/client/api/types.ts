/** Kiểu dữ liệu trả về từ backend cho khu client (du khách + đối tác) */

export type RoleName = 'TRAVELLER' | 'BUSINESS_OWNER' | 'ADMIN';

export interface ClientUser {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  roles: RoleName[];
}

export interface ProfileInput {
  name: string;
  phoneNumber: string | null;
  /** yyyy-MM-dd */
  dateOfBirth: string | null;
  avatarUrl: string | null;
}

export type BudgetLevel = 'SAVING' | 'MEDIUM' | 'LUXURY';
export type TravelStyle = 'RELAX' | 'ADVENTURE' | 'CULTURE' | 'FAMILY' | 'SOLO' | 'LUXURY';

/** Sở thích du lịch (GET/PUT /api/users/me/preferences) — các list là mã tham chiếu của BE */
export interface TravelPreferences {
  budgetLevel: BudgetLevel | null;
  travelStyle: TravelStyle | null;
  notes: string | null;
  interests: string[];
  specialNeeds: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  /** Số giây access token còn hiệu lực */
  expiresIn: number;
  user: ClientUser;
}

export type BusinessProfileStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface BusinessProfile {
  id: number;
  userId: number;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  taxCode: string;
  contactEmail: string;
  contactPhone: string;
  status: BusinessProfileStatus;
  /** Lý do admin đưa ra khi từ chối (INACTIVE) hoặc khóa (SUSPENDED) */
  statusNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfileInput {
  businessName: string;
  taxCode: string;
  contactEmail: string;
  contactPhone: string;
}

export interface ReferenceItem {
  id?: number;
  code: string;
  name: string;
}

/** Nhóm dịch vụ (Lưu trú, Ẩm thực…) cùng các loại con đang hoạt động */
export interface CategoryGroup extends ReferenceItem {
  subtypes: ReferenceItem[];
}

export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

/** dayOfWeek: 1 = Thứ 2 … 7 = Chủ nhật; giờ dạng HH:mm, null khi đóng cửa */
export interface OpeningHour {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  closed: boolean;
}

export interface PlacePrice {
  /** Ví dụ ROOM_NIGHT, TICKET, AVG_MEAL, AVG_DRINK, OTHER */
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

/** Nội dung một địa điểm (đang công khai hoặc trong bản sửa) */
export interface PlaceContent {
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  group: ReferenceItem | null;
  category: ReferenceItem | null;
  /** Loại hình phụ (không bắt buộc), có thể thuộc nhóm khác */
  secondaryGroup?: ReferenceItem | null;
  secondaryCategory?: ReferenceItem | null;
  province: ReferenceItem | null;
  openingHours: OpeningHour[];
  prices: PlacePrice[];
  images: PlaceImage[];
}

/** Địa điểm duy nhất của doanh nghiệp và trạng thái duyệt */
export interface BusinessListing extends PlaceContent {
  id: number;
  businessId: number;
  businessName: string;
  placeId: number;
  /** DRAFT khi chưa duyệt, ACTIVE khi đã công khai */
  placeStatus: string;
  status: ListingStatus;
  /** Lý do admin từ chối (khi REJECTED) */
  statusNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessListingInput {
  name: string;
  /** Mã loại con, ví dụ "homestay" */
  categoryCode: string;
  /** Loại hình phụ — bỏ trống / null = không có */
  secondaryCategoryCode?: string | null;
  provinceCode: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  openingHours: OpeningHour[];
  prices: Omit<PlacePrice, 'currency'>[];
  images: PlaceImage[];
}

/** Bản sửa địa điểm đã duyệt — CANCELLED: đối tác đã rút lại */
export type RevisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type RevisionRejectCode = 'pricing' | 'location' | 'photos' | 'duplicate' | 'other';

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** Một dòng trong danh sách địa điểm công khai (GET /api/places) */
export interface PlaceSummary {
  id: number;
  name: string;
  group: ReferenceItem | null;
  category: ReferenceItem | null;
  secondaryGroup?: ReferenceItem | null;
  secondaryCategory?: ReferenceItem | null;
  province: ReferenceItem | null;
  address: string | null;
  coverUrl: string | null;
  rating: number | null;
  reviewCount: number;
}

/** Chi tiết địa điểm công khai (GET /api/places/{id}) */
export interface PlaceDetail {
  summary: PlaceSummary;
  description: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  openingHours: OpeningHour[];
  prices: PlacePrice[];
  images: PlaceImage[];
}

export interface ListingRevision {
  id: number;
  listingId: number;
  businessName: string;
  status: RevisionStatus;
  proposed: PlaceContent;
  rejectReasonCode: RevisionRejectCode | null;
  /** Góp ý của admin khi từ chối */
  partnerFeedback: string | null;
  createdAt: string;
  reviewedAt: string | null;
}
