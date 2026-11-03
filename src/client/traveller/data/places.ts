/**
 * Kiểu dữ liệu màn Khám phá / Chi tiết điểm đến / Yêu thích — giống constants/places.ts của mobile.
 * Chưa có dữ liệu — sẽ nối API địa điểm sau.
 */

export type PlaceCategory = 'all' | 'food' | 'culture' | 'nature' | 'shopping';

export interface PlaceTag {
  label: string;
  icon: string;
}

export interface PlaceInfoItem {
  label: string;
  value: string;
  note: string;
  icon: string;
  tone: 'blue' | 'orange' | 'green' | 'purple';
}

export interface PhotoSpot {
  name: string;
  subtitle: string;
  image: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  address: string;
  tag: string;
  tagIcon: string;
  category: PlaceCategory;
  rating: number;
  reviews: string;
  reviewCount: string;
  description: string;
  priceLabel: string;
  priceNote?: string;
  image: string;
  badge?: string;
  rank: string;
  tags: PlaceTag[];
  weather: {
    temperature: number;
    condition: string;
    icon: string;
    status: string;
    extraLabel: string;
    extraValue: string;
  };
  intro: string;
  info: PlaceInfoItem[];
  photoSpots: PhotoSpot[];
  map: { distance: string; landmark: string; latitude: number; longitude: number };
}

export const PLACES: Place[] = [];

export const getPlace = (id: string | undefined): Place | undefined =>
  PLACES.find((place) => place.id === id);

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu */
export const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
