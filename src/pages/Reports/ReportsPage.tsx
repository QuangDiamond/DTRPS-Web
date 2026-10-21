import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ErrorState, PageLoader } from '@/components/common';
import { useListings, usePartners, usePois, useResource, useToast, useUsers } from '@/hooks';
import { reportService } from '@/services/reportService';
import type { ReportFilters, ReportOverview } from '@/types';
import AiInsightsModal from './components/AiInsightsModal';
import PartnerPerformanceCard from './components/PartnerPerformanceCard';
import PoiCategoryBreakdown from './components/PoiCategoryBreakdown';
import ReportKpiGrid from './components/ReportKpiGrid';
import ReportsFilterBar from './components/ReportsFilterBar';
import ReportsHeader from './components/ReportsHeader';
import TopDestinations from './components/TopDestinations';
import TrafficTrendChart from './components/TrafficTrendChart';
import TripSeasonChart from './components/TripSeasonChart';
import {
  DEFAULT_REPORT_FILTERS,
  exportReportCsv,
  REPORT_REGION_OPTIONS,
  REPORT_SERVICE_OPTIONS,
  reportFiltersKey,
  type ReportTotals,
  scaleCategories,
  scaleTotals,
} from './reportUtils';

/** Chu kỳ tự làm mới số liệu báo cáo */
const AUTO_REFRESH_MS = 60_000;

/** Màn Báo cáo & Thống kê: /admin/reports — dữ liệu tổng hợp theo bộ lọc qua reportService */
export default function ReportsPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  useTranslation();
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_REPORT_FILTERS);
  // Đổi bộ lọc → khóa mới → tải lại báo cáo cho phạm vi đó
  return (
    <ReportView key={reportFiltersKey(filters)} filters={filters} onFiltersChange={setFilters} />
  );
}

interface ReportViewProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

function ReportView({ filters, onFiltersChange }: ReportViewProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { stats: userStats } = useUsers();
  const { stats: partnerStats } = usePartners();
  const { stats: poiStats } = usePois();
  const { stats: listingStats } = useListings();
  const report = useResource(
    () => reportService.getOverview(filters),
    () => reportService.peekOverview(filters),
  );
  const [aiOpen, setAiOpen] = useState(false);

  const data = report.data;
  // Số tổng lấy từ store (khớp Dashboard và các màn danh sách) × tỷ trọng phạm vi đang lọc
  const totals = useMemo(
    () =>
      scaleTotals(
        {
          users: userStats.total,
          partners: partnerStats.total,
          pois: poiStats.total,
          approved: listingStats.approved,
          rejected: listingStats.rejected,
        },
        data?.coverage ?? 1,
      ),
    [
      userStats.total,
      partnerStats.total,
      poiStats.total,
      listingStats.approved,
      listingStats.rejected,
      data?.coverage,
    ],
  );
  const scopeLabel = [
    REPORT_REGION_OPTIONS.find((option) => option.value === filters.region)?.label,
    REPORT_SERVICE_OPTIONS.find((option) => option.value === filters.service)?.label.toLowerCase(),
  ].join(' • ');

  // "Cập nhật thời gian thực": tự tải lại số liệu định kỳ khi admin đang xem trang
  const reloadRef = useRef(report.reload);
  useEffect(() => {
    reloadRef.current = report.reload;
  });
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') reloadRef.current();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const handleExportCsv = () => {
    if (!data) return;
    exportReportCsv(data, totals, filters);
    showToast(t('reports.page.reportExportedCsvFile'));
  };

  const handleExportPdf = () => {
    showToast(t('reports.page.chooseSaveAsPdf'), 'info');
    // Chờ toast hiện xong rồi mới mở hộp thoại in (hộp thoại chặn luồng render)
    window.setTimeout(() => window.print(), 300);
  };

  return (
    <div className="flex w-full flex-col space-y-7">
      <div className="flex flex-col gap-4">
        <ReportsHeader
          onExportPdf={handleExportPdf}
          onExportCsv={handleExportCsv}
          onOpenAi={() => data && setAiOpen(true)}
        />
        <ReportsFilterBar filters={filters} onChange={onFiltersChange} />
      </div>

      {report.status === 'error' && !data ? (
        <ErrorState
          title={t('reports.page.couldNotLoadReport')}
          message={report.error}
          onRetry={report.reload}
        />
      ) : !data ? (
        <PageLoader />
      ) : (
        <ReportBody
          report={data}
          totals={totals}
          filters={filters}
          onOpenAi={() => setAiOpen(true)}
        />
      )}

      {aiOpen && data && (
        <AiInsightsModal
          insights={data.insights}
          generatedAt={data.generatedAt}
          scopeLabel={scopeLabel}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

interface ReportBodyProps {
  report: ReportOverview;
  totals: ReportTotals;
  filters: ReportFilters;
  onOpenAi: () => void;
}

function ReportBody({ report, totals, filters, onOpenAi }: ReportBodyProps) {
  const { partners } = usePartners();
  const knownPartnerIds = useMemo(() => new Set(partners.map((partner) => partner.id)), [partners]);
  const categories = useMemo(() => scaleCategories(report, totals.pois), [report, totals.pois]);
  const tripsYear = report.trips.reduce((sum, point) => sum + point.trips, 0);
  const firstInsight = report.insights[0];

  return (
    <>
      <ReportKpiGrid kpis={report.kpis} totals={totals} tripsPerYear={tripsYear} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <TrafficTrendChart
          data={report.traffic}
          dateRange={filters.dateRange}
          year={new Date(filters.dateRange.to).getFullYear()}
          insight={firstInsight ? `${firstInsight.title}. ${firstInsight.detail}` : ''}
          onOpenInsight={onOpenAi}
        />
        <TripSeasonChart data={report.trips} insights={report.tripInsights} />
      </div>

      <TopDestinations destinations={report.destinations} totalTrips={report.kpis.tripsCreated} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <PoiCategoryBreakdown categories={categories} total={totals.pois} />
        <PartnerPerformanceCard partners={report.topPartners} knownPartnerIds={knownPartnerIds} />
      </div>
    </>
  );
}
