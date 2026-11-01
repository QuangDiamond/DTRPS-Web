import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal, ErrorState, PageHeader, PageLoader } from '@/components/common';
import { LISTING_CATEGORY_CONFIG } from '@/constants/listing';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { PROVINCE_NAMES } from '@/constants/partner';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import { useAuth, useListings, usePartners, useResource, useToast, useUsers } from '@/hooks';
import { dashboardService } from '@/services/dashboardService';
import type {
  DashboardOverview,
  DashboardRange,
  DashboardStats,
  DateRange,
  Listing,
} from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDayTime, todayIsoDate } from '@/utils/format';
import ActivityFeed from './components/ActivityFeed';
import CategoryDonut from './components/CategoryDonut';
import DashboardActions from './components/DashboardActions';
import GrowthChart from './components/GrowthChart';
import KpiGrid from './components/KpiGrid';
import PendingListingsTable from './components/PendingListingsTable';
import { formatDateRange, getPresetRange } from './dashboardUtils';

const PREVIEW_LIMIT = 4;
const REFRESH_DELAY_MS = 800;

/** Tải dữ liệu tổng quan (KPI gốc, biểu đồ tăng trưởng, cơ cấu danh mục) qua dashboardService */
export default function DashboardPage() {
  // Theo dõi ngôn ngữ để toàn bộ nội dung trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const overview = useResource(
    () => dashboardService.getOverview(),
    () => dashboardService.peekOverview(),
  );

  if (overview.status === 'error') {
    return (
      <ErrorState
        title={t('dashboard.loadError')}
        message={overview.error}
        onRetry={overview.reload}
      />
    );
  }
  if (!overview.data) return <PageLoader />;
  return <DashboardContent overview={overview.data} />;
}

function DashboardContent({ overview }: { overview: DashboardOverview }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { showToast } = useToast();
  const { listings, activities, stats: listingStats, approveListings } = useListings();
  const { stats: userStats } = useUsers();
  const { stats: partnerStats } = usePartners();

  const [range, setRange] = useState<DashboardRange>('7days');
  const [dateRange, setDateRange] = useState<DateRange>(() => getPresetRange('7days'));
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState<Listing | null>(null);

  // Người dùng / đối tác / niêm yết lấy từ store chung → thao tác ở trang nào cũng cập nhật ở đây
  const stats: DashboardStats = {
    ...overview.stats,
    totalUsers: userStats.total,
    totalPartners: partnerStats.total,
    newPartnersThisMonth: partnerStats.newThisMonth,
    pendingReviews: listingStats.pending,
    approvedListings: listingStats.approved,
    rejectedListings: listingStats.rejected,
  };

  const pendingListings = useMemo(
    () =>
      listings
        .filter((listing) => listing.status === 'pending')
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [listings],
  );

  // ===== Khoảng thời gian =====
  const handleRangeChange = (next: DashboardRange) => {
    setRange(next);
    if (next !== 'custom') setDateRange(getPresetRange(next));
  };

  const handleCustomRange = (next: DateRange) => {
    setRange('custom');
    setDateRange(next);
    showToast(t('dashboard.toast.filtered', { range: formatDateRange(next) }), 'info');
  };

  // ===== Duyệt nhanh (cần xác nhận) =====
  const confirmApprove = () => {
    if (!approving) return;
    approveListings([approving.id]);
    showToast(t('dashboard.toast.approved', { name: approving.name }));
    setApproving(null);
  };

  // ===== Khác =====
  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showToast(t('dashboard.toast.refreshed'), 'info');
    }, REFRESH_DELAY_MS);
  };

  const handleExport = () => {
    const kpiRows: (string | number)[][] = [
      [t('dashboard.kpi.totalUsers'), stats.totalUsers],
      [t('dashboard.kpi.totalPartners'), stats.totalPartners],
      [t('dashboard.kpi.totalListings'), stats.totalListings],
      [t('dashboard.kpi.pendingReviews'), stats.pendingReviews],
      [t('dashboard.kpi.approvedListings'), stats.approvedListings],
      [t('dashboard.kpi.rejectedListings'), stats.rejectedListings],
    ];
    const pendingRows = pendingListings.map((listing) => [
      listing.id,
      listing.name,
      listing.partnerName,
      LISTING_CATEGORY_CONFIG[listing.category].label,
      PROVINCE_NAMES[listing.province],
      formatDayTime(listing.submittedAt),
    ]);

    downloadCsv(
      `${t('dashboard.csv.filename')}-${todayIsoDate()}.csv`,
      [t('dashboard.csv.metricOrCode'), t('dashboard.csv.valueOrName')],
      [
        [t('dashboard.csv.period'), formatDateRange(dateRange)],
        ...kpiRows,
        [],
        [
          t('dashboard.csv.code'),
          t('dashboard.csv.place'),
          t('dashboard.csv.partner'),
          t('dashboard.csv.category'),
          t('dashboard.csv.province'),
          t('dashboard.csv.submittedAt'),
        ],
        ...pendingRows,
      ],
    );
    showToast(t('dashboard.toast.exported'));
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('pages.dashboard.breadcrumb') }]}
        title={t('pages.dashboard.title')}
        titleBadge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-[11px] font-bold text-on-secondary-container">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {t('dashboard.live')}
          </span>
        }
        description={t('dashboard.welcome', { name: admin?.name ?? t('common.administrator') })}
        actions={
          <DashboardActions
            range={range}
            dateRange={dateRange}
            onRangeChange={handleRangeChange}
            onCustomRangeApply={handleCustomRange}
            onExport={handleExport}
          />
        }
      />

      <KpiGrid stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GrowthChart data={overview.growthSeries} onViewReport={() => navigate(ROUTES.REPORTS)} />
        <CategoryDonut data={overview.categoryShares} />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <PendingListingsTable
          listings={pendingListings}
          totalPending={stats.pendingReviews}
          previewLimit={PREVIEW_LIMIT}
          onApprove={setApproving}
          onView={(listing) => navigate(listingReviewPath(listing.id))}
          onViewAll={() => navigate(ROUTES.LISTINGS_PENDING)}
        />
        <ActivityFeed activities={activities} refreshing={refreshing} onRefresh={handleRefresh} />
      </div>

      {approving && (
        <ConfirmModal
          title={t('dashboard.approveConfirm.title')}
          confirmLabel={t('dashboard.approveConfirm.confirm')}
          confirmIcon="verified"
          onConfirm={confirmApprove}
          onClose={() => setApproving(null)}
        >
          <Trans
            i18nKey="dashboard.approveConfirm.message"
            values={{ name: approving.name, partner: approving.partnerName }}
            components={{ c0: <strong className="text-on-surface" /> }}
          />
          <span className="mt-2 block font-body-sm text-body-sm text-outline">
            {t('dashboard.approveConfirm.note')}
          </span>
        </ConfirmModal>
      )}
    </div>
  );
}
