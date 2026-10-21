import { useTranslation } from 'react-i18next';
import { Icon, StatCard } from '@/components/common';
import type { PartnerStats } from '@/types';
import { formatNumber, formatPercent } from '@/utils/format';

interface PartnerStatsCardsProps {
  stats: PartnerStats;
}

function ShareFooter({ value, className }: { value: string; className: string }) {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex items-center justify-between text-body-sm text-on-surface-variant">
      <span>{t('partners.partnerStatsCards.ecosystemShare')}</span>
      <span className={`font-label-sm text-label-sm font-bold ${className}`}>{value}</span>
    </div>
  );
}

export default function PartnerStatsCards({ stats }: PartnerStatsCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('partners.partnerStatsCards.totalPartners')}
        value={formatNumber(stats.total)}
        icon="corporate_fare"
        iconClassName="bg-secondary-container text-on-secondary-container"
        footer={
          <div className="mt-4 flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed-variant">
              <Icon name="trending_up" className="text-[14px]" /> +
              {formatNumber(stats.newThisMonth)}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t('partners.partnerStatsCards.joinedThisMonth')}
            </span>
          </div>
        }
      />
      <StatCard
        label={t('partners.partnerStatsCards.accommodationHotels')}
        value={formatNumber(stats.lodging)}
        icon="hotel"
        iconClassName="bg-surface-container-high text-primary"
        footer={
          <ShareFooter value={formatPercent(stats.lodging, stats.total)} className="text-primary" />
        }
      />
      <StatCard
        label={t('partners.partnerStatsCards.restaurantsDining')}
        value={formatNumber(stats.culinary)}
        icon="restaurant"
        iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
        footer={
          <ShareFooter
            value={formatPercent(stats.culinary, stats.total)}
            className="text-tertiary"
          />
        }
      />
      <StatCard
        label={t('partners.partnerStatsCards.attractionsTours')}
        value={formatNumber(stats.experiences)}
        icon="tour"
        iconClassName="bg-surface-container-highest text-on-surface"
        footer={
          <ShareFooter
            value={formatPercent(stats.experiences, stats.total)}
            className="text-on-surface"
          />
        }
      />
    </div>
  );
}
