import type { OpeningHour, PlacePrice, RevisionRejectCode } from '@/client/api/types';

export const DAY_LABELS: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
};

export const PRICE_TYPES: { value: string; label: string }[] = [
  { value: 'ROOM_NIGHT', label: 'Giá phòng / đêm' },
  { value: 'TICKET', label: 'Giá vé vào cổng' },
  { value: 'AVG_MEAL', label: 'Giá món / bữa ăn' },
  { value: 'AVG_DRINK', label: 'Giá đồ uống' },
  { value: 'OTHER', label: 'Khác' },
];

export const REJECT_REASONS: Record<RevisionRejectCode, string> = {
  pricing: 'Giá chưa chính xác',
  location: 'Vị trí / địa chỉ chưa đúng',
  photos: 'Hình ảnh không đạt yêu cầu',
  duplicate: 'Trùng lặp địa điểm khác',
  other: 'Lý do khác',
};

export const MAX_IMAGES = 10;
export const MAX_PRICES = 20;

export const priceLabel = (price: Pick<PlacePrice, 'priceType' | 'description'>): string =>
  price.description ||
  PRICE_TYPES.find((type) => type.value === price.priceType)?.label ||
  price.priceType;

export const formatMoney = (amount: number, currency = 'VND'): string =>
  `${new Intl.NumberFormat('vi-VN').format(amount)} ${currency === 'VND' ? '₫' : currency}`;

export const hourText = (hour: OpeningHour): string =>
  hour.closed ? 'Đóng cửa' : `${hour.openTime} – ${hour.closeTime}`;

const defaultDay = (dayOfWeek: number): OpeningHour => ({
  dayOfWeek,
  openTime: '08:00',
  closeTime: '22:00',
  closed: false,
});

/** Đủ 7 ngày để chỉnh; ngày chưa khai báo lấy giờ mặc định */
export const fullWeek = (hours: OpeningHour[]): OpeningHour[] =>
  [1, 2, 3, 4, 5, 6, 7].map(
    (day) => hours.find((hour) => hour.dayOfWeek === day) ?? defaultDay(day),
  );
