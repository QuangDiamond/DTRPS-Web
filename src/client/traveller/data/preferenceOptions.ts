/**
 * Lựa chọn cho bước "Yêu cầu đặc biệt" của màn Sở thích du lịch (UC-006).
 * Lấy từ GET /api/reference/special-needs; icon hiển thị được tra theo mã (code) ở đây.
 */
import type { ReferenceItem } from '@/client/api/types';

export interface IconOption<T extends string = string> {
  id: T;
  label: string;
  icon: string;
  note?: string;
}

/** Icon theo mã của BE */
const SPECIAL_NEED_ICONS: Record<string, string> = {
  vegetarian: 'eco',
  diet: 'no_meals',
  kids: 'child_care',
  elderly: 'elderly',
  pets: 'pets',
  other: 'more_horiz',
};
const DEFAULT_SPECIAL_NEED_ICON = 'info';

export const toSpecialNeedOptions = (items: ReferenceItem[]): IconOption[] =>
  items.map((item) => ({
    id: item.code,
    label: item.name,
    icon: SPECIAL_NEED_ICONS[item.code] ?? DEFAULT_SPECIAL_NEED_ICON,
  }));
