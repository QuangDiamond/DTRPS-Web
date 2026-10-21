import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import type { DashboardStats } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';
import KpiCard from './KpiCard';

const TREND_PILL_CLASS =
  'flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-[12px] font-bold text-primary';

export default function KpiGrid({ stats }: { stats: DashboardStats }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <KpiCard
        label={t('dashboard.kpi.totalUsers')}
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
            <span>{t('dashboard.kpi.vs30Days')}</span>
            <span className="text-outline">
              {t('dashboard.kpi.newUsersApprox', { count: formatNumber(stats.newUsers30Days) })}
            </span>
          </>
        }
        onClick={() => navigate(ROUTES.USERS)}
      />

      <KpiCard
        label={t('dashboard.kpi.totalPartners')}
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
            <span>{t('dashboard.kpi.newPartnersLabel')}</span>
            <span className="font-semibold text-on-surface">
              {t('dashboard.kpi.newPartnersValue', {
                count: formatNumber(stats.newPartnersThisMonth),
              })}
            </span>
          </>
        }
        onClick={() => navigate(ROUTES.PARTNERS)}
      />

      <KpiCard
        label={t('dashboard.kpi.totalListings')}
        icon="store_mall_directory"
        iconClassName="bg-tertiary-fixed text-tertiary"
        value={formatNumber(stats.totalListings)}
        aside={
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 font-label-sm text-[12px] font-medium text-on-surface-variant">
            {t('dashboard.kpi.listingTypes')}
          </span>
        }
        footerClassName="gap-2"
        footer={
          <>
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <span>{t('dashboard.kpi.coverage', { covered: stats.provincesCovered })}</span>
          </>
        }
        onClick={() => navigate(ROUTES.LISTINGS)}
      />

      <KpiCard
        highlight
        label={t('dashboard.kpi.pendingReviews')}
        icon="pending_actions"
        iconClassName="bg-tertiary-fixed-dim/40 text-tertiary-container"
        value={formatNumber(stats.pendingReviews)}
        valueClassName="text-tertiary"
        valueAddon={
          stats.pendingReviews > 0 && (
            <span className="animate-pulse rounded-full bg-tertiary-fixed px-2.5 py-0.5 font-label-sm text-[11px] font-bold text-on-tertiary-fixed">
              {t('dashboard.kpi.needsAction')}
            </span>
          )
        }
        aside={<Icon name="priority_high" className="text-[20px] text-tertiary" />}
        footerClassName="justify-between"
        footer={
          <>
            <span>{t('dashboard.kpi.avgWait')}</span>
            <span className="font-semibold text-tertiary">
              {t('dashboard.kpi.hours', { count: stats.avgWaitHours })}
            </span>
          </>
        }
        onClick={() => navigate(ROUTES.LISTINGS_PENDING)}
      />

      <KpiCard
        label={t('dashboard.kpi.approvedListings')}
        icon="check_circle"
        iconClassName="bg-secondary-container text-on-secondary-container"
        value={formatNumber(stats.approvedListings)}
        aside={
          <div className={`${TREND_PILL_CLASS} bg-secondary-container/60`}>
            {t('dashboard.kpi.meetsStandard', {
              percent: formatPercent(stats.approvedListings, stats.totalListings),
            })}
          </div>
        }
        footerClassName="gap-1.5"
        footer={
          <>
            <Icon name="verified" className="text-[16px] text-primary" />
            <span>{t('dashboard.kpi.syncedToAi')}</span>
          </>
        }
        onClick={() => navigate(ROUTES.LISTINGS_APPROVED)}
      />

      <KpiCard
        label={t('dashboard.kpi.rejectedListings')}
        icon="cancel"
        iconClassName="bg-error-container text-on-error-container"
        value={formatNumber(stats.rejectedListings)}
        aside={
          <span className="rounded-full bg-error-container/60 px-2.5 py-1 font-label-sm text-[12px] font-bold text-error">
            {t('dashboard.kpi.ofAllSubmissions', {
              percent: formatPercent(stats.rejectedListings, stats.totalListings),
            })}
          </span>
        }
        footer={<span>{t('dashboard.kpi.mainRejectReason')}</span>}
        onClick={() => navigate(ROUTES.LISTINGS_REJECTED)}
      />
    </div>
  );
}
