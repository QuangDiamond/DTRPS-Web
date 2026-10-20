import { CATEGORY_SHARES, DASHBOARD_STATS, GROWTH_SERIES } from '../constants/mockData';
import type { DashboardOverview } from '../types/api';
import { ENDPOINTS } from './endpoints';
import { peek, readRequest } from './request';

const MOCK_OVERVIEW: DashboardOverview = {
  stats: DASHBOARD_STATS,
  growthSeries: GROWTH_SERIES,
  categoryShares: CATEGORY_SHARES,
};

export const dashboardService = {
  peekOverview: (): DashboardOverview | undefined => peek(() => MOCK_OVERVIEW),
  getOverview: (): Promise<DashboardOverview> =>
    readRequest(ENDPOINTS.dashboard.overview, () => MOCK_OVERVIEW),
};
