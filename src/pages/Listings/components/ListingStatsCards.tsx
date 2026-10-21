import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { ListingStats } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';

interface ListingStatsCardsProps {
  stats: ListingStats;
  overdueCount: number;
}

const CARD_CLASS =
  'flex items-center justify-between rounded-2xl bg-surface-container-lowest p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]';
const LABEL_CLASS = 'font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase';
const ICON_BOX_CLASS = 'flex h-12 w-12 items-center justify-center rounded-2xl';

export default function ListingStatsCards({ stats, overdueCount }: ListingStatsCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>{t('listings.listingStatsCards.totalSystemListings')}</span>
          <span className="font-display-sm text-display-sm font-bold text-on-surface">
            {formatNumber(stats.total)}
          </span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm text-primary">
            <Icon name="trending_up" className="text-[15px]" />{' '}
            {t('listings.listingStatsCards.n84VsLast')}
          </span>
        </div>
        <div className={`${ICON_BOX_CLASS} bg-surface-container-high text-primary`}>
          <Icon name="map" className="text-[26px]" />
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={LABEL_CLASS}>{t('listings.listingStatsCards.urgentPending')}</span>
            {stats.pending > 0 && (
              <span className="h-2 w-2 animate-ping rounded-full bg-tertiary" />
            )}
          </div>
          <span className="font-display-sm text-display-sm font-bold text-tertiary">
            {formatNumber(stats.pending)}
          </span>
          <span
            className={`flex items-center gap-1 font-body-sm text-body-sm font-medium ${
              overdueCount > 0 ? 'text-error' : 'text-on-surface-variant'
            }`}
          >
            <Icon name="timer" className="text-[15px]" />{' '}
            {t('listings.listingStatsCards.submissionsWaitingOver24h', { count: overdueCount })}
          </span>
        </div>
        <div className={`${ICON_BOX_CLASS} bg-tertiary-fixed text-on-tertiary-fixed`}>
          <Icon name="pending_actions" className="text-[26px]" />
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>{t('listings.listingStatsCards.approved')}</span>
          <span className="font-display-sm text-display-sm font-bold text-primary">
            {formatNumber(stats.approved)}
          </span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="check_circle" className="text-[15px] text-primary" />{' '}
            {t('listings.listingStatsCards.approvalRate', {
              approved: formatPercent(stats.approved, stats.total),
            })}
          </span>
        </div>
        <div className={`${ICON_BOX_CLASS} bg-secondary-container text-on-secondary-container`}>
          <Icon name="task_alt" className="text-[26px]" />
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>{t('listings.listingStatsCards.rejectedDefective')}</span>
          <span className="font-display-sm text-display-sm font-bold text-outline">
            {formatNumber(stats.rejected)}
          </span>
          <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="rule" className="text-[15px]" />{' '}
            {t('listings.listingStatsCards.additionalPermitsRequested')}
          </span>
        </div>
        <div className={`${ICON_BOX_CLASS} bg-error-container/60 text-on-error-container`}>
          <Icon name="assignment_late" className="text-[26px]" />
        </div>
      </div>
    </div>
  );
}
