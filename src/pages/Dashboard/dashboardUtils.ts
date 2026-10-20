import type { DashboardRange, DateRange, SelectOption } from '../../types/admin';
import { formatDate, toIsoDate } from '../../utils/format';

export type PresetRange = Exclude<DashboardRange, 'custom'>;

export const RANGE_OPTIONS: SelectOption<DashboardRange>[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: 'thisyear', label: 'Năm nay' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

/** Khung thẻ dùng chung của Dashboard */
export const DASHBOARD_CARD_CLASS =
  'rounded-2xl border border-surface-container/60 bg-surface-container-lowest p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]';

export function getPresetRange(range: PresetRange, today: Date = new Date()): DateRange {
  const from = new Date(today);
  if (range === '7days') from.setDate(today.getDate() - 6);
  if (range === '30days') from.setDate(today.getDate() - 29);
  if (range === 'thisyear') from.setMonth(0, 1);
  return { from: toIsoDate(from), to: toIsoDate(today) };
}

export function formatDateRange(range: DateRange): string {
  return range.from === range.to
    ? formatDate(range.from)
    : `${formatDate(range.from)} - ${formatDate(range.to)}`;
}
