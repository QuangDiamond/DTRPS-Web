import type { PlaceReviewStatus, ReportReason, ReportStatus, ReviewSort } from '@/types';
import { toIsoDate } from '@/utils/format';

/** Lọc số sao: nhóm nhanh (tiêu cực / trung bình / tích cực) hoặc đúng một mức */
export const RATING_FILTERS = {
  negative: { min: 1, max: 2 },
  neutral: { min: 3, max: 3 },
  positive: { min: 4, max: 5 },
  '5': { min: 5, max: 5 },
  '4': { min: 4, max: 4 },
  '3': { min: 3, max: 3 },
  '2': { min: 2, max: 2 },
  '1': { min: 1, max: 1 },
} as const;
export type RatingFilter = keyof typeof RATING_FILTERS;
export const RATING_GROUPS: RatingFilter[] = ['negative', 'neutral', 'positive'];
export const RATING_EXACT: RatingFilter[] = ['5', '4', '3', '2', '1'];

export const isRatingFilter = (value: string | null): value is RatingFilter =>
  value !== null && value in RATING_FILTERS;

/** Khoảng thời gian gửi đánh giá */
export const PERIODS = ['all', 'today', '7d', '30d', 'custom'] as const;
export type Period = (typeof PERIODS)[number];

export const isPeriod = (value: string | null): value is Period =>
  PERIODS.some((period) => period === value);

/** Ngày bắt đầu / kết thúc (yyyy-MM-dd, gồm cả hai đầu) của khoảng thời gian đã chọn */
export function periodRange(
  period: Period,
  customFrom: string,
  customTo: string,
): { from?: string; to?: string } {
  if (period === 'custom') return { from: customFrom || undefined, to: customTo || undefined };
  if (period === 'all') return {};
  const days = period === 'today' ? 0 : period === '7d' ? 6 : 29;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { from: toIsoDate(start), to: toIsoDate(new Date()) };
}

export const REVIEW_SORTS: ReviewSort[] = ['newest', 'oldest', 'lowest', 'highest'];

export const isReviewSort = (value: string | null): value is ReviewSort =>
  REVIEW_SORTS.some((sort) => sort === value);

/** Nhãn + màu trạng thái hiển thị của đánh giá */
export const STATUS_STYLE: Record<
  PlaceReviewStatus,
  { labelKey: `reviewAdmin.status.${PlaceReviewStatus}`; className: string; icon: string }
> = {
  visible: {
    labelKey: 'reviewAdmin.status.visible',
    className: 'bg-secondary-container text-on-secondary-container',
    icon: 'visibility',
  },
  hidden: {
    labelKey: 'reviewAdmin.status.hidden',
    className: 'bg-error-container text-on-error-container',
    icon: 'visibility_off',
  },
};

export const REPORT_REASONS: ReportReason[] = [
  'SPAM',
  'OFFENSIVE',
  'INAPPROPRIATE',
  'MISLEADING',
  'FAKE',
  'PRIVACY',
  'OTHER',
];

export const REPORT_STATUSES: ReportStatus[] = ['pending', 'resolved', 'dismissed'];

/** Màu nhãn trạng thái báo cáo */
export const REPORT_STATUS_TONE: Record<ReportStatus, string> = {
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed',
  resolved: 'bg-error-container text-on-error-container',
  dismissed: 'bg-surface-container-high text-on-surface-variant',
};
