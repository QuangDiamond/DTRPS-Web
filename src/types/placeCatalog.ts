/** Kho địa điểm của admin (bảng places): POI do nền tảng tạo + địa điểm của đối tác */
import type { PlaceContent, RefItem, ReviewListingStatus } from './listingReview';

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

export interface CatalogPlaceDetail {
  place: CatalogPlace;
  content: PlaceContent;
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
