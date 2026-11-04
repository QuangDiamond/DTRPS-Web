/**
 * Lựa chọn cho màn Sở thích du lịch (UC-006).
 * Danh sách sở thích / nhu cầu đặc biệt lấy từ BE (GET /api/reference/...),
 * ảnh và icon hiển thị được tra theo mã (code) ở đây; ngân sách / phong cách là enum cố định
 * của TravelPreferences nên vẫn khai báo tĩnh.
 */
import type { BudgetLevel, ReferenceItem, TravelStyle } from '@/client/api/types';

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

/** Bước 1 – Trải nghiệm: ảnh minh họa theo mã sở thích của BE */
const INTEREST_IMAGES: Record<string, string> = {
  nature: img('1528127269322-539801943592'),
  culture: img('1559592413-7cec4d0cae2b'),
  food: img('1555126634-323283e090fa'),
  photo: img('1490750967868-88aa4486c946'),
  shopping: img('1583417319070-4a69db38a482'),
  nightlife: img('1528181304800-259b08848526'),
  beach: img('1507525428034-b723cf961d3e'),
};
const DEFAULT_INTEREST_IMAGE = img('1488646953014-85cb44e25828');

/** Bước 2 – Ngân sách (chọn 1, không có bảng tham chiếu ở BE) */
export const BUDGET_OPTIONS: IconOption<BudgetLevel>[] = [
  { id: 'SAVING', label: 'Tiết kiệm', note: 'Dưới 5.000.000đ', icon: 'savings' },
  {
    id: 'MEDIUM',
    label: 'Trung bình',
    note: '5.000.000đ - 15.000.000đ',
    icon: 'account_balance_wallet',
  },
  { id: 'LUXURY', label: 'Cao cấp', note: 'Trên 15.000.000đ', icon: 'diamond' },
];

/** Bước 3 – Phong cách (chọn 1, không có bảng tham chiếu ở BE) */
export const STYLE_OPTIONS: ImageOption<TravelStyle>[] = [
  { id: 'RELAX', label: 'Thư giãn', image: img('1506461883276-594a12b11cf3') },
  { id: 'ADVENTURE', label: 'Phiêu lưu', image: img('1570366583862-f91883984fde') },
  { id: 'CULTURE', label: 'Khám phá văn hóa', image: img('1540611025311-01df3cef54b5') },
  { id: 'FAMILY', label: 'Du lịch gia đình', image: img('1564596823821-79b97151055e') },
  { id: 'SOLO', label: 'Du lịch một mình', image: img('1509030450996-dd1a26dda07a') },
  { id: 'LUXURY', label: 'Du lịch cao cấp', image: img('1573270689103-d7a4e42b609a') },
];

/** Bước 4 – Yêu cầu đặc biệt: icon theo mã của BE */
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
