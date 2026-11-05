/**
 * Lựa chọn cho màn Sở thích du lịch (UC-006).
 * "Trải nghiệm" lấy từ loại hình địa điểm (GET /api/reference/interests → place_categories),
 * "Yêu cầu đặc biệt" lấy từ GET /api/reference/special-needs; ảnh/icon hiển thị được tra theo
 * mã (code) ở đây. Ngân sách là enum cố định của TravelPreferences nên vẫn khai báo tĩnh.
 */
import type { ReferenceItem } from '@/client/api/types';

export interface ImageOption<T extends string = string> {
  id: T;
  label: string;
  image: string;
}

export interface IconOption<T extends string = string> {
  id: T;
  label: string;
  icon: string;
  note?: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

/** Bước 1 – Trải nghiệm: ảnh minh họa theo mã loại hình địa điểm (place_categories) */
const INTEREST_IMAGES: Record<string, string> = {
  // Lưu trú
  resort: img('1507525428034-b723cf961d3e'),
  homestay: img('1528127269322-539801943592'),
  // Ẩm thực
  restaurant: img('1555126634-323283e090fa'),
  cafe: img('1555126634-323283e090fa'),
  localEatery: img('1555126634-323283e090fa'),
  barPub: img('1528181304800-259b08848526'),
  // Vui chơi & Tham quan
  heritage: img('1559592413-7cec4d0cae2b'),
  park: img('1528127269322-539801943592'),
  scenicSpot: img('1528127269322-539801943592'),
  checkinSpot: img('1490750967868-88aa4486c946'),
  // Mua sắm & Đặc sản
  nightMarket: img('1528181304800-259b08848526'),
  specialtyStore: img('1583417319070-4a69db38a482'),
  souvenirShop: img('1583417319070-4a69db38a482'),
  craftVillage: img('1559592413-7cec4d0cae2b'),
};
const DEFAULT_INTEREST_IMAGE = img('1488646953014-85cb44e25828');

/** Bước 2 – Yêu cầu đặc biệt: icon theo mã của BE */
const SPECIAL_NEED_ICONS: Record<string, string> = {
  vegetarian: 'eco',
  diet: 'no_meals',
  kids: 'child_care',
  elderly: 'elderly',
  pets: 'pets',
  other: 'more_horiz',
};
const DEFAULT_SPECIAL_NEED_ICON = 'info';

export const toInterestOptions = (items: ReferenceItem[]): ImageOption[] =>
  items.map((item) => ({
    id: item.code,
    label: item.name,
    image: INTEREST_IMAGES[item.code] ?? DEFAULT_INTEREST_IMAGE,
  }));

export const toSpecialNeedOptions = (items: ReferenceItem[]): IconOption[] =>
  items.map((item) => ({
    id: item.code,
    label: item.name,
    icon: SPECIAL_NEED_ICONS[item.code] ?? DEFAULT_SPECIAL_NEED_ICON,
  }));
