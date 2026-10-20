import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorState from '../../components/common/ErrorState';
import PageHeader from '../../components/common/PageHeader';
import PageLoader from '../../components/common/PageLoader';
import { LISTING_CATEGORY_CONFIG } from '../../constants/listing';
import { ADMIN_ROOT_CRUMB } from '../../constants/navigation';
import { PROVINCE_NAMES } from '../../constants/partner';
import { listingReviewPath, ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useListings';
import { usePartners } from '../../hooks/usePartners';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardRange, DashboardStats, DateRange, Listing } from '../../types/admin';
import type { DashboardOverview } from '../../types/api';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDayTime, todayIsoDate } from '../../utils/format';
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
  const overview = useResource(
    () => dashboardService.getOverview(),
    () => dashboardService.peekOverview(),
  );

  if (overview.status === 'error') {
    return (
      <ErrorState
        title="Không tải được dữ liệu tổng quan"
        message={overview.error}
        onRetry={overview.reload}
      />
    );
  }
  if (!overview.data) return <PageLoader />;
  return <DashboardContent overview={overview.data} />;
}

function DashboardContent({ overview }: { overview: DashboardOverview }) {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { showToast } = useToast();
  const { listings, activities, stats: listingStats, approveListings } = useListings();
  const { stats: userStats } = useUsers();
  const { stats: partnerStats } = usePartners();

  const [range, setRange] = useState<DashboardRange>('7days');
  const [dateRange, setDateRange] = useState<DateRange>(() => getPresetRange('7days'));
  const [refreshing, setRefreshing] = useState(false);

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
    showToast(`Đã lọc dữ liệu từ ${formatDateRange(next)}`, 'info');
  };

  // ===== Duyệt nhanh =====
  const handleApprove = (listing: Listing) => {
    approveListings([listing.id]);
    showToast(`Đã duyệt & xuất bản ${listing.name}`);
  };

  // ===== Khác =====
  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      showToast('Đã cập nhật hoạt động mới nhất', 'info');
    }, REFRESH_DELAY_MS);
  };

  const handleExport = () => {
    const kpiRows: (string | number)[][] = [
      ['Tổng số người dùng', stats.totalUsers],
      ['Tổng số đối tác', stats.totalPartners],
      ['Tổng niêm yết hệ thống', stats.totalListings],
      ['Chờ xem xét duyệt', stats.pendingReviews],
      ['Địa điểm đã duyệt', stats.approvedListings],
      ['Niêm yết bị từ chối', stats.rejectedListings],
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
      `bang-dieu-khien-${todayIsoDate()}.csv`,
      ['Chỉ số / Mã', 'Giá trị / Tên'],
      [
        ['Khoảng thời gian', formatDateRange(dateRange)],
        ...kpiRows,
        [],
        ['Mã', 'Địa điểm', 'Đối tác', 'Danh mục', 'Tỉnh/Thành', 'Thời gian gửi'],
        ...pendingRows,
      ],
    );
    showToast('Đã xuất dữ liệu bảng điều khiển (CSV mở bằng Excel)');
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        breadcrumbs={[ADMIN_ROOT_CRUMB, { label: 'Bảng điều khiển chính' }]}
        title="Bảng điều khiển Tổng quan"
        titleBadge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-[11px] font-bold text-on-secondary-container">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Trực tiếp
          </span>
        }
        description={`Chào mừng trở lại, ${admin?.name ?? 'Quản trị viên'} hệ thống! Dữ liệu cập nhật theo thời gian thực hôm nay.`}
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
          onApprove={handleApprove}
          onView={(listing) => navigate(listingReviewPath(listing.id))}
          onViewAll={() => navigate(`${ROUTES.LISTINGS}?status=pending`)}
        />
        <ActivityFeed activities={activities} refreshing={refreshing} onRefresh={handleRefresh} />
      </div>
    </div>
  );
}
