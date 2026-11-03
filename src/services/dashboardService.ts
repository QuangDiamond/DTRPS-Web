import type { DashboardOverview } from '@/types';
import { ENDPOINTS } from './endpoints';
import { readRequest } from './request';

export const dashboardService = {
  getOverview: (): Promise<DashboardOverview> => readRequest(ENDPOINTS.dashboard.overview),
};
