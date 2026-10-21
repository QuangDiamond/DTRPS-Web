/** Điểm đến POI */
import type { Language } from './common';

/** Nội dung POI đã dịch sang một ngôn ngữ khác */
export interface PoiTranslation {
  subCategory?: string;
  highlight?: string;
}

export type PoiCategory = 'heritage' | 'nature' | 'food' | 'resort' | 'stay' | 'craft' | 'tour';

/** Tab lọc nhanh trên màn danh sách POI */
export type PoiCategoryTab = 'all' | 'heritage' | 'food' | 'stay' | 'nature' | 'craft';

/** Nhóm thống kê trên thẻ KPI */
export type PoiKpiGroup = 'sights' | 'food' | 'stay' | 'tour';

export type PoiStatus = 'active' | 'maintenance' | 'paused' | 'draft';

export type PoiSource = 'gov' | 'openData' | 'authority' | 'partner' | 'system';

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
  /** Bản dịch nội dung hiển thị theo ngôn ngữ (tiếng Việt là bản gốc ở các trường trên) */
  translations?: Partial<Record<Exclude<Language, 'vi'>, PoiTranslation>>;
  /** Danh mục phụ / tag gợi ý AI, phân tách bằng dấu phẩy */
  tags: string;
  description: string;
  price: string;
  openingHours: string;
  suggestedDuration: string;
  /** Đã sinh embedding và index vào CSDL vector (pgvector) */
  vectorEmbedded: boolean;
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
export type PoiSystemField =
  'id' | 'updatedAt' | 'updatedBy' | 'source' | 'sourceLabel' | 'rating' | 'reviewCount';

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
