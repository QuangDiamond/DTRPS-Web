import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import { ROUTES } from '../../../constants/routes';
import type { DashboardStats } from '../../../types/admin';
import { formatNumber, formatPercent } from '../../../utils/format';
import KpiCard from './KpiCard';

const TREND_PILL_CLASS =
  'flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-[12px] font-bold text-primary';

export default function KpiGrid({ stats }: { stats: DashboardStats }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        label="Tổng số người dùng"
        icon="group"
        iconClassName="bg-secondary-container/60 text-primary"
        value={formatNumber(stats.totalUsers)}
        aside={
          <div className={`${TREND_PILL_CLASS} bg-secondary-container/50`}>
            <Icon name="trending_up" className="text-[15px]" />+{stats.userGrowthPercent}%
          </div>
        }
        footer={
          <>
            <span>So với 30 ngày trước</span>
            <span className="text-outline">(≈ +{formatNumber(stats.newUsers30Days)} người)</span>
          </>
        }
        onClick={() => navigate(ROUTES.USERS)}
      />

      <KpiCard
        label="Tổng số đối tác"
        icon="business_center"
        iconClassName="bg-surface-container-high text-primary"
        value={formatNumber(stats.totalPartners)}
        aside={
          <div className={`${TREND_PILL_CLASS} bg-surface-container-highest`}>
            <Icon name="trending_up" className="text-[15px]" />+{stats.partnerGrowthPercent}%
          </div>
        }
        footer={
          <>
            <span>Cơ sở mới tháng này:</span>
            <span className="font-semibold text-on-surface">
              +{formatNumber(stats.newPartnersThisMonth)} doanh nghiệp
            </span>
          </>
        }
        onClick={() => navigate(ROUTES.PARTNERS)}
      />

      <KpiCard
        label="Tổng niêm yết hệ thống"
        icon="store_mall_directory"
        iconClassName="bg-tertiary-fixed text-tertiary"
        value={formatNumber(stats.totalListings)}
        aside={
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-[12px] font-medium text-on-surface-variant">
            Khách sạn, F&amp;B, POI
          </span>
        }
        footerClassName="gap-2"
        footer={
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span>Phủ sóng tại {stats.provincesCovered}/63 tỉnh thành Việt Nam</span>
          </>
        }
        onClick={() => navigate(ROUTES.LISTINGS)}
      />

      <KpiCard
        highlight
        label="Chờ xem xét duyệt"
        icon="pending_actions"
        iconClassName="bg-tertiary-fixed-dim/40 text-tertiary-container"
        value={formatNumber(stats.pendingReviews)}
        valueClassName="text-tertiary"
        valueAddon={
          stats.pendingReviews > 0 && (
            <span className="animate-pulse rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-label-sm text-[11px] font-bold text-on-tertiary-fixed">
              Cần xử lý ngay
            </span>
          )
        }
        aside={<Icon name="priority_high" className="text-[20px] text-tertiary" />}
        footerClassName="justify-between"
        footer={
          <>
            <span>Thời gian chờ trung bình:</span>
            <span className="font-semibold text-tertiary">{stats.avgWaitHours} giờ</span>
          </>
        }
        onClick={() => navigate(`${ROUTES.LISTINGS}?status=pending`)}
      />

      <KpiCard
        label="Địa điểm đã duyệt"
        icon="check_circle"
        iconClassName="bg-secondary-container text-on-secondary-container"
        value={formatNumber(stats.approvedListings)}
        aside={
          <div className={`${TREND_PILL_CLASS} bg-secondary-container/60`}>
            {formatPercent(stats.approvedListings, stats.totalListings)} đạt chuẩn
          </div>
        }
        footerClassName="gap-1.5"
        footer={
          <>
            <Icon name="verified" className="text-[16px] text-primary" />
            <span>Đã đồng bộ lên AI Travel Agent</span>
          </>
        }
        onClick={() => navigate(ROUTES.LISTINGS_APPROVED)}
      />

      <KpiCard
        label="Niêm yết bị từ chối"
        icon="cancel"
        iconClassName="bg-error-container text-on-error-container"
        value={formatNumber(stats.rejectedListings)}
        aside={
          <span className="rounded-full bg-error-container/60 px-2.5 py-1 font-label-sm text-[12px] font-bold text-error">
            {formatPercent(stats.rejectedListings, stats.totalListings)} tổng hồ sơ
          </span>
        }
        footer={<span>Lý do chính: Vi phạm tiêu chuẩn/thiếu pháp lý</span>}
        onClick={() => navigate(ROUTES.LISTINGS_REJECTED)}
      />
    </div>
  );
}
