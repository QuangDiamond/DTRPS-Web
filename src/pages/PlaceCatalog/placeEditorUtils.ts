import type { OpeningHour, TranslationKey } from '@/types';

export const MAX_IMAGES = 10;
export const MAX_PRICES = 20;
export const MAX_DESCRIPTION = 2000;

/** Ô nhập chuẩn của form admin */
export const INPUT_CLASS =
  'w-full rounded-lg bg-surface-container-low px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';

/** Loại giá — cùng mã với form đối tác (BE lưu chữ in hoa) */
export const PRICE_TYPES: { value: string; labelKey: TranslationKey }[] = [
  { value: 'ROOM_NIGHT', labelKey: 'placeEditor.priceTypes.ROOM_NIGHT' },
  { value: 'TICKET', labelKey: 'placeEditor.priceTypes.TICKET' },
  { value: 'AVG_MEAL', labelKey: 'placeEditor.priceTypes.AVG_MEAL' },
  { value: 'AVG_DRINK', labelKey: 'placeEditor.priceTypes.AVG_DRINK' },
  { value: 'OTHER', labelKey: 'placeEditor.priceTypes.OTHER' },
];

export const priceTypeKey = (type: string): TranslationKey | undefined =>
  PRICE_TYPES.find((item) => item.value === type)?.labelKey;

const defaultDay = (dayOfWeek: number): OpeningHour => ({
  dayOfWeek,
  openTime: '08:00',
  closeTime: '22:00',
  closed: false,
});

/** Luôn đủ 7 ngày (Thứ 2 = 1 … Chủ nhật = 7); ngày chưa có lấy giờ mặc định */
export const fullWeek = (hours: OpeningHour[]): OpeningHour[] =>
  [1, 2, 3, 4, 5, 6, 7].map(
    (day) => hours.find((hour) => hour.dayOfWeek === day) ?? defaultDay(day),
  );

/** Ngày đóng cửa gửi giờ null */
export const cleanWeek = (week: OpeningHour[]): OpeningHour[] =>
  week.map((hour) => (hour.closed ? { ...hour, openTime: null, closeTime: null } : hour));

/** Ngày mở cửa thiếu giờ hoặc giờ mở = giờ đóng */
export const invalidDay = (week: OpeningHour[]): OpeningHour | undefined =>
  week.find(
    (hour) =>
      !hour.closed && (!hour.openTime || !hour.closeTime || hour.openTime === hour.closeTime),
  );

export const parseNumber = (value: string): number | null => {
  const parsed = Number(value.trim().replace(',', '.'));
  return value.trim() && Number.isFinite(parsed) ? parsed : null;
};

export const isHttpsUrl = (value: string): boolean => /^https:\/\/\S+$/.test(value.trim());

/** Ảnh đọc được trước khi gửi — BE vẫn kiểm tra lại theo nội dung file */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
