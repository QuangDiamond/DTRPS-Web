/** Dựng báo cáo mẫu theo bộ lọc — mô phỏng phép tổng hợp phía server */
import {
  MOCK_DESTINATIONS,
  MOCK_MONTHLY_TRAFFIC,
  MOCK_MONTHLY_TRIPS,
  MOCK_PARTNER_PERFORMANCE,
  MOCK_POI_CATEGORIES,
  MOCK_REPORT_BASE,
  MOCK_REPORT_INSIGHTS,
  MOCK_TRIP_INSIGHTS,
} from '@/mocks/data/mockReports';
import type {
  PartnerType,
  ReportFilters,
  ReportOverview,
  ReportRegion,
  ReportService,
} from '@/types';

const REGION_SHARE: Record<ReportRegion, number> = {
  all: 1,
  north: 0.36,
  central: 0.41,
  south: 0.23,
};

const SERVICE_SHARE: Record<ReportService, number> = {
  all: 1,
  hotel: 0.42,
  fnb: 0.28,
  attraction: 0.18,
  experience: 0.12,
};

const SERVICE_PARTNER_TYPES: Record<ReportService, PartnerType[] | null> = {
  all: null,
  hotel: ['hotel'],
  fnb: ['fnb'],
  attraction: ['attraction'],
  experience: ['tour'],
};

const REGION_PROVINCES: Record<Exclude<ReportRegion, 'all'>, string[]> = {
  north: ['hanoi', 'ninhbinh', 'thanhhoa'],
  central: ['danang', 'quangnam', 'quangngai'],
  south: ['hcm', 'kiengiang'],
};

const DAY_MS = 86_400_000;

/** Số ngày trong kỳ / 365 — dùng co giãn các chỉ số phát sinh theo thời gian */
function periodShare({ dateRange }: ReportFilters): number {
  const days = (Date.parse(dateRange.to) - Date.parse(dateRange.from)) / DAY_MS + 1;
  return Math.min(1, Math.max(1, days) / 365);
}

export function buildMockReport(filters: ReportFilters, now: Date = new Date()): ReportOverview {
  const scope = REGION_SHARE[filters.region] * SERVICE_SHARE[filters.service];
  const timeShare = periodShare(filters);
  const currentMonth = now.getMonth() + 1;
  const scaleCount = (value: number) => Math.round(value * scope);

  const partnerTypes = SERVICE_PARTNER_TYPES[filters.service];
  const tripsYear = MOCK_MONTHLY_TRIPS.reduce((sum, value) => sum + value, 0);

  return {
    coverage: scope,
    kpis: {
      userGrowthYoY: MOCK_REPORT_BASE.userGrowthYoY,
      monthlyActiveUsers: Math.round(
        MOCK_REPORT_BASE.monthlyActiveUsers * REGION_SHARE[filters.region],
      ),
      tripsCreated: Math.round(tripsYear * scope * timeShare),
      aiQueries: Math.round(MOCK_REPORT_BASE.aiQueriesYear * scope * timeShare),
      aiHitRate: MOCK_REPORT_BASE.aiHitRate,
      aiAvgSimilarity: MOCK_REPORT_BASE.aiAvgSimilarity,
      partnerGrowthQoQ: MOCK_REPORT_BASE.partnerGrowthQoQ,
      provincesCovered:
        filters.region === 'all'
          ? MOCK_REPORT_BASE.provincesCovered
          : Math.round(MOCK_REPORT_BASE.provincesCovered * REGION_SHARE[filters.region]),
      avgApprovalHours: MOCK_REPORT_BASE.avgApprovalHours,
    },
    traffic: MOCK_MONTHLY_TRAFFIC.map((point, index) => ({
      month: index + 1,
      pageViewsK: Math.round(point.pageViewsK * scope),
      newUsers: scaleCount(point.newUsers),
      projected: index + 1 > currentMonth,
    })),
    trips: MOCK_MONTHLY_TRIPS.map((trips, index) => ({
      month: index + 1,
      trips: scaleCount(trips),
    })),
    tripInsights: MOCK_TRIP_INSIGHTS,
    destinations: MOCK_DESTINATIONS.filter(
      (destination) => filters.region === 'all' || destination.region === filters.region,
    )
      .map((destination) => ({
        ...destination,
        plannedTrips: Math.round(
          destination.plannedTrips * SERVICE_SHARE[filters.service] * timeShare,
        ),
      }))
      .slice(0, 6),
    poiCategories: MOCK_POI_CATEGORIES.filter(
      (category) => filters.service === 'all' || category.id === filters.service,
    ).map((category) => ({
      ...category,
      count: Math.round(category.count * REGION_SHARE[filters.region]),
    })),
    topPartners: MOCK_PARTNER_PERFORMANCE.filter(
      (partner) =>
        (!partnerTypes || partnerTypes.includes(partner.type)) &&
        (filters.region === 'all' || REGION_PROVINCES[filters.region].includes(partner.province)),
    ).map((partner) => ({
      ...partner,
      bookings: Math.round(partner.bookings * timeShare),
      revenueVnd: Math.round(partner.revenueVnd * timeShare),
    })),
    insights: MOCK_REPORT_INSIGHTS,
    generatedAt: now.toISOString(),
  };
}
