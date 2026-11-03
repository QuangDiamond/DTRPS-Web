import type { ReportFilters, ReportOverview } from '@/types';
import { ENDPOINTS } from './endpoints';
import { readRequest } from './request';

const toQuery = (filters: ReportFilters) => ({
  from: filters.dateRange.from,
  to: filters.dateRange.to,
  region: filters.region,
  service: filters.service,
});

export const reportService = {
  /** GET /reports/overview?from&to&region&service — server tổng hợp theo bộ lọc */
  getOverview: (filters: ReportFilters): Promise<ReportOverview> =>
    readRequest(ENDPOINTS.reports.overview, toQuery(filters)),
};
