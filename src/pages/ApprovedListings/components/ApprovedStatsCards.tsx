import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { ListingStats } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';

const CARD_CLASS =
  'relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-[0_4px_20px_-2px_rgba(15,118,110,0.06)]';
const PILL_CLASS =
  'flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold';

export default function ApprovedStatsCards({ stats }: { stats: ListingStats }) {
  const { t } = useTranslation();
  const visible = Math.max(0, stats.approved - stats.hidden);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className={CARD_CLASS}>
        <div className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 rounded-full bg-primary/5" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('approvedListings.approvedStatsCards.totalApprovedPlaces')}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="verified" className="text-[20px]" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
            {formatNumber(stats.approved)}
          </span>
          <span className={`${PILL_CLASS} bg-secondary-container text-on-secondary-container`}>
            <Icon name="check_circle" className="text-[12px]" />
            {t('approvedListings.approvedStatsCards.meetStandards', {
              approved: formatPercent(stats.approved, stats.total),
            })}
          </span>
        </div>
        <div className="mt-2 font-body-sm text-body-sm text-outline">
          {t('approvedListings.approvedStatsCards.all63Provinces')}
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 rounded-full bg-secondary/5" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('approvedListings.approvedStatsCards.publiclyVisible')}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container/40 text-secondary">
            <Icon name="public" className="text-[20px]" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display-sm text-display-sm font-bold tracking-tight text-secondary">
            {formatNumber(visible)}
          </span>
          <span className={`${PILL_CLASS} bg-primary-fixed text-on-primary-fixed-variant`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {t('approvedListings.approvedStatsCards.visible', {
              visible: formatPercent(visible, stats.approved),
            })}
          </span>
        </div>
        <div className="mt-2 font-body-sm text-body-sm text-outline">
          {t('approvedListings.approvedStatsCards.readyTravelersExplore')}
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 rounded-full bg-surface-dim/40" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('approvedListings.approvedStatsCards.hiddenUnderMaintenance')}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
            <Icon name="visibility_off" className="text-[20px]" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
            {formatNumber(stats.hidden)}
          </span>
          <span className={`${PILL_CLASS} bg-surface-container-high text-on-surface-variant`}>
            {t('approvedListings.approvedStatsCards.temporarilyArchived')}
          </span>
        </div>
        <div className="mt-2 font-body-sm text-body-sm text-outline">
          {t('approvedListings.approvedStatsCards.waitingPartnerReopen')}
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 rounded-full bg-tertiary-fixed-dim/20" />
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('approvedListings.approvedStatsCards.savesBookingsThisWeek')}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-fixed text-tertiary">
            <Icon name="bookmark_add" className="text-[20px]" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
            {formatNumber(stats.weeklyEngagements)}
          </span>
          <span className={`${PILL_CLASS} bg-secondary-container text-on-secondary-container`}>
            <Icon name="trending_up" className="text-[12px]" />+{stats.weeklyEngagementGrowth}%
          </span>
        </div>
        <div className="mt-2 font-body-sm text-body-sm text-outline">
          {t('approvedListings.approvedStatsCards.strongItineraryEngagement')}
        </div>
      </div>
    </div>
  );
}
