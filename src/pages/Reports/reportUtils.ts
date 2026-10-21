import i18n from 'i18next';
import { PARTNER_TYPE_CONFIG, PROVINCE_NAMES } from '@/constants/partner';
import type {
  DateRange,
  ReportFilters,
  ReportOverview,
  ReportPeriod,
  ReportRegion,
  ReportService,
  SelectOption,
} from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDate, formatMonthShort, formatNumber, toIsoDate } from '@/utils/format';

/** Khung thẻ chung theo thiết kế Stitch màn Báo cáo */
export const REPORT_CARD_CLASS =
  'rounded-3xl border border-surface-container/80 bg-surface-container-lowest p-6 shadow-xs';

export const REPORT_REGION_OPTIONS: SelectOption<ReportRegion>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('reports.utils.nationwide');
    },
  },
  {
    value: 'north',
    get label() {
      return i18n.t('reports.utils.northernVietnam');
    },
  },
  {
    value: 'central',
    get label() {
      return i18n.t('reports.utils.centralVietnam');
    },
  },
  {
    value: 'south',
    get label() {
      return i18n.t('reports.utils.southernVietnam');
    },
  },
];

export const REPORT_SERVICE_OPTIONS: SelectOption<ReportService>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('reports.utils.allServices');
    },
  },
  {
    value: 'hotel',
    get label() {
      return i18n.t('reports.utils.hotelsHomestays');
    },
  },
  {
    value: 'fnb',
    get label() {
      return i18n.t('reports.utils.foodEateries');
    },
  },
  {
    value: 'attraction',
    get label() {
      return i18n.t('reports.utils.attractionsTours');
    },
  },
  {
    value: 'experience',
    get label() {
      return i18n.t('reports.utils.localExperiences');
    },
  },
];

export type PresetPeriod = Exclude<ReportPeriod, 'custom'>;

/** Nút chọn nhanh kỳ báo cáo — nhãn quý/năm theo thời điểm hiện tại */
export function getPeriodOptions(now: Date = new Date()): { value: PresetPeriod; label: string }[] {
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return [
    { value: '7days', label: i18n.t('reports.utils.n7Days') },
    { value: '30days', label: i18n.t('reports.utils.n30Days') },
    {
      value: 'quarter',
      label: i18n.t('reports.utils.q', { quarter, getFullYear: now.getFullYear() }),
    },
    { value: 'year', label: i18n.t('reports.utils.year', { getFullYear: now.getFullYear() }) },
  ];
}

export function getPeriodRange(period: PresetPeriod, now: Date = new Date()): DateRange {
  const from = new Date(now);
  if (period === '7days') from.setDate(now.getDate() - 6);
  if (period === '30days') from.setDate(now.getDate() - 29);
  if (period === 'quarter') from.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
  if (period === 'year') from.setMonth(0, 1);
  return { from: toIsoDate(from), to: toIsoDate(now) };
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  region: 'all',
  service: 'all',
  period: 'quarter',
  dateRange: getPeriodRange('quarter'),
};

/** "01/07/2026 - Hôm nay" */
export function formatReportRange({ from, to }: DateRange, today = toIsoDate(new Date())): string {
  const end = to === today ? i18n.t('reports.utils.today') : formatDate(to);
  return from === to ? end : `${formatDate(from)} - ${end}`;
}

/** Khóa ổn định của bộ lọc — đổi khóa là tải lại báo cáo */
export const reportFiltersKey = (filters: ReportFilters): string =>
  [filters.region, filters.service, filters.dateRange.from, filters.dateRange.to].join('|');

/** Tháng đang nằm trong kỳ báo cáo (để tô đậm trên trục X) */
export function isMonthInRange(month: number, { from, to }: DateRange): boolean {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const year = toDate.getFullYear();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  return monthEnd >= fromDate && monthStart <= toDate;
}

/** 4,800,000 → "4.8 Triệu"; 18,420,000,000 → "18.4 Tỷ" */
export function formatVndCompact(value: number): string {
  if (Math.abs(value) >= 1e9)
    return i18n.t('reports.utils.b', { toFixed: (value / 1e9).toFixed(1) });
  if (Math.abs(value) >= 1e6)
    return i18n.t('reports.utils.m', { toFixed: (value / 1e6).toFixed(1) });
  return formatNumber(value);
}

/** 58200 → "58.2k" */
export const formatThousands = (value: number): string =>
  value >= 1000 ? `${Number((value / 1000).toFixed(1))}k` : String(value);

export const formatSigned = (value: number, suffix = '%'): string =>
  `${value > 0 ? '+' : ''}${value}${suffix}`;

export interface ReportTotals {
  users: number;
  partners: number;
  pois: number;
  approvalRate: number;
}

/** Số tổng tồn kho theo phạm vi lọc: lấy từ store (đúng với các màn khác) × tỷ trọng phạm vi */
export function scaleTotals(
  live: { users: number; partners: number; pois: number; approved: number; rejected: number },
  coverage: number,
): ReportTotals {
  const reviewed = live.approved + live.rejected;
  return {
    users: Math.round(live.users * coverage),
    partners: Math.round(live.partners * coverage),
    pois: Math.round(live.pois * coverage),
    approvalRate: reviewed === 0 ? 0 : Math.round((live.approved / reviewed) * 1000) / 10,
  };
}

/** Phân bố danh mục co giãn theo tổng POI (giữ tỷ lệ của báo cáo) */
export function scaleCategories(report: ReportOverview, totalPois: number) {
  const sum = report.poiCategories.reduce((total, category) => total + category.count, 0);
  return report.poiCategories.map((category) => {
    const share = sum === 0 ? 0 : category.count / sum;
    return { ...category, count: Math.round(share * totalPois), share: share * 100 };
  });
}

export function exportReportCsv(
  report: ReportOverview,
  totals: ReportTotals,
  filters: ReportFilters,
): void {
  const region = REPORT_REGION_OPTIONS.find((option) => option.value === filters.region)?.label;
  const service = REPORT_SERVICE_OPTIONS.find((option) => option.value === filters.service)?.label;
  const rows: (string | number)[][] = [
    [
      i18n.t('reports.utils.scope'),
      `${region} • ${service} • ${formatReportRange(filters.dateRange)}`,
      '',
    ],
    ['', '', ''],
    [i18n.t('reports.utils.metric'), i18n.t('reports.utils.value'), i18n.t('reports.utils.notes')],
    [
      i18n.t('reports.utils.totalUsers'),
      totals.users,
      formatSigned(report.kpis.userGrowthYoY) + ' YoY',
    ],
    [i18n.t('reports.utils.monthlyActiveUsersMau'), report.kpis.monthlyActiveUsers, ''],
    [i18n.t('reports.utils.tripsCreated'), report.kpis.tripsCreated, ''],
    [
      i18n.t('reports.utils.aiQueries'),
      report.kpis.aiQueries,
      i18n.t('reports.utils.aiQueriesNote', {
        rate: report.kpis.aiHitRate,
        similarity: report.kpis.aiAvgSimilarity,
      }),
    ],
    [
      i18n.t('reports.utils.businessPartners'),
      totals.partners,
      formatSigned(report.kpis.partnerGrowthQoQ) + ' Q/Q',
    ],
    [
      i18n.t('reports.utils.totalPoiPlaces'),
      totals.pois,
      i18n.t('reports.utils.provinces', { provincesCovered: report.kpis.provincesCovered }),
    ],
    [
      i18n.t('reports.utils.listingApprovalRate'),
      totals.approvalRate,
      i18n.t('reports.utils.avgReviewHrs', { avgApprovalHours: report.kpis.avgApprovalHours }),
    ],
    ['', '', ''],
    [
      i18n.t('reports.utils.month'),
      i18n.t('reports.utils.viewsThousands'),
      i18n.t('reports.utils.newUsers'),
    ],
    ...report.traffic.map((point) => [
      formatMonthShort(point.month),
      point.pageViewsK,
      point.newUsers,
    ]),
    ['', '', ''],
    [i18n.t('reports.utils.month'), i18n.t('reports.utils.trips'), ''],
    ...report.trips.map((point) => [formatMonthShort(point.month), point.trips, '']),
    ['', '', ''],
    [
      i18n.t('reports.utils.destination'),
      i18n.t('reports.utils.itinerariesPlanned'),
      i18n.t('reports.utils.growth'),
    ],
    ...report.destinations.map((item) => [
      item.name,
      item.plannedTrips,
      formatSigned(item.growthPercent),
    ]),
    ['', '', ''],
    [
      i18n.t('reports.utils.poiCategory'),
      i18n.t('reports.utils.places'),
      i18n.t('reports.utils.share'),
    ],
    ...scaleCategories(report, totals.pois).map((item) => [
      item.label,
      item.count,
      item.share.toFixed(1),
    ]),
    ['', '', ''],
    [
      i18n.t('reports.utils.partner'),
      i18n.t('reports.utils.bookings'),
      i18n.t('reports.utils.revenueVnd'),
    ],
    ...report.topPartners.map((partner) => [
      `${partner.name} (${PARTNER_TYPE_CONFIG[partner.type].label} • ${PROVINCE_NAMES[partner.province]})`,
      partner.bookings,
      partner.revenueVnd,
    ]),
  ];
  downloadCsv(
    `bao-cao-thong-ke-${filters.dateRange.from}_${filters.dateRange.to}.csv`,
    [i18n.t('reports.utils.item'), i18n.t('reports.utils.value'), i18n.t('reports.utils.notes')],
    rows,
  );
}

/** Màu thanh theo danh mục (giữ thứ tự màu của thiết kế) */
export const CATEGORY_BAR_TONES = [
  { icon: 'text-primary', bar: 'bg-primary' },
  { icon: 'text-secondary', bar: 'bg-secondary' },
  { icon: 'text-tertiary', bar: 'bg-tertiary' },
  { icon: 'text-primary-container', bar: 'bg-primary-container' },
  { icon: 'text-on-surface-variant', bar: 'bg-on-surface-variant' },
];

/** Đường cong mượt qua các điểm (Catmull-Rom → Bezier) */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const p0 = points[index - 2] ?? points[index - 1];
    const p1 = points[index - 1];
    const p2 = point;
    const p3 = points[index + 1] ?? point;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    return `${path} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }, '');
}
