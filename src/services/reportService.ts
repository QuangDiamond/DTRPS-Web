import { buildMockReport } from '@/mocks/builders/reportMock';
import type { ReportFilters, ReportOverview } from '@/types';
import { ENDPOINTS } from './endpoints';
import { peek, readRequest } from './request';

const toQuery = (filters: ReportFilters) => ({
  from: filters.dateRange.from,
  to: filters.dateRange.to,
  region: filters.region,
  service: filters.service,
});

export const reportService = {
  /** Báo cáo có sẵn ngay ở chế độ mock (undefined khi dùng API — cần tải) */
  peekOverview: (filters: ReportFilters): ReportOverview | undefined =>
    peek(() => buildMockReport(filters)),
  /** GET /reports/overview?from&to&region&service — server tổng hợp theo bộ lọc */
  getOverview: (filters: ReportFilters): Promise<ReportOverview> =>
    readRequest(ENDPOINTS.reports.overview, () => buildMockReport(filters), toQuery(filters)),
};
