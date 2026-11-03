/** Kho địa điểm của admin (bảng places): POI do nền tảng tạo + địa điểm của đối tác */
import type {
  OpeningHour,
  PlaceContent,
  PlaceImage,
  PlacePrice,
  RefItem,
  ReviewListingStatus,
} from './listingReview';

/** partner = địa điểm có niêm yết của đối tác; admin = POI do nền tảng tạo */
export type PlaceSource = 'partner' | 'admin';

/** draft = chưa công khai (đối tác chờ duyệt); paused / maintenance = tạm ngưng */
export type CatalogPlaceStatus = 'draft' | 'active' | 'maintenance' | 'paused';

export interface CatalogPlace {
  id: string;
  name: string;
  group: RefItem | null;
  category: RefItem | null;
  province: RefItem | null;
  address: string | null;
  status: CatalogPlaceStatus;
  source: PlaceSource;
  listingId?: string;
  listingStatus?: ReviewListingStatus;
  businessName?: string;
  coverUrl?: string;
  imageCount: number;
  /** null khi chưa có đánh giá hiển thị */
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Ảnh / giá kèm id để admin xoá, sửa, đặt ảnh chính */
export interface CatalogImage extends PlaceImage {
  id: string;
}
export interface CatalogPrice extends PlacePrice {
  id: string;
}

export interface CatalogPlaceDetail {
  place: CatalogPlace;
  content: PlaceContent;
  /** false với địa điểm của đối tác — chỉ đổi qua bản sửa của đối tác */
  editable: boolean;
  images: CatalogImage[];
  prices: CatalogPrice[];
}

/** Dữ liệu form thêm / sửa địa điểm của admin. Khi sửa: danh sách bỏ trống (undefined) = giữ nguyên */
export interface CatalogPlaceInput {
  name: string;
  categoryCode: string;
  provinceCode: string;
  address: string;
  description: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  status: Uppercase<CatalogPlaceStatus>;
  openingHours?: OpeningHour[];
  prices?: Omit<PlacePrice, 'currency'>[];
  images?: PlaceImage[];
}

export interface CatalogPriceInput {
  priceType: string;
  amount: number;
  description: string | null;
}

/** Loại địa điểm (loại con trong một nhóm dịch vụ) — trang quản lý loại địa điểm */
export type CategoryStatus = 'active' | 'inactive';
export interface PlaceCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: CategoryStatus;
  placeCount: number;
}
export interface PlaceCategoryGroup {
  id: string;
  code: string;
  name: string;
  types: PlaceCategory[];
}
export interface PlaceCategoryInput {
  groupCode: string;
  /** Chỉ dùng khi tạo — mã không đổi được */
  code?: string;
  name: string;
  description: string | null;
}

export interface CatalogStats {
  total: number;
  active: number;
  draft: number;
  /** PAUSED + MAINTENANCE */
  paused: number;
  partner: number;
  admin: number;
  newThisMonth: number;
  /** Theo mã nhóm: lodging, fnb, attraction, shopping */
  byGroup: Record<string, number>;
}

export interface CatalogQuery {
  keyword?: string;
  group?: string;
  province?: string;
  status?: CatalogPlaceStatus | 'all';
  source?: PlaceSource | 'all';
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}

/** Nhóm dịch vụ cùng các loại con (từ /reference/categories) */
export interface CategoryGroupRef extends RefItem {
  subtypes: RefItem[];
}
