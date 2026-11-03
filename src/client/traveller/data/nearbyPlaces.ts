/** Kiểu dữ liệu màn Thêm địa điểm vào lịch trình — chưa có dữ liệu, sẽ nối API sau */

export type NearbyCategory = 'nearest' | 'food' | 'cafe' | 'culture' | 'nature';

export interface NearbyPlace {
  id: string;
  name: string;
  category: Exclude<NearbyCategory, 'nearest'>;
  categoryLabel: string;
  categoryIcon: string;
  /** Khoảng cách (mét), dùng để sắp xếp "Gần đây nhất" */
  distance: number;
  rating: number;
  reviews: string;
  duration: string;
  price: string;
  note: string;
  image: string;
}

export const NEARBY_CATEGORIES: { id: NearbyCategory; label: string; icon: string }[] = [
  { id: 'nearest', label: 'Gần đây nhất', icon: 'near_me' },
  { id: 'food', label: 'Ẩm thực', icon: 'restaurant' },
  { id: 'cafe', label: 'Cà phê & Chill', icon: 'local_cafe' },
  { id: 'culture', label: 'Văn hoá', icon: 'account_balance' },
  { id: 'nature', label: 'Thiên nhiên', icon: 'landscape' },
];

export const NEARBY_PLACES: NearbyPlace[] = [];

/** 900 → "900m", 2500 → "2.5 km" */
export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)} km`;
