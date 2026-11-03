import { useTranslation } from 'react-i18next';
import { Icon, StatCard } from '@/components/common';
import type { PartnerStats } from '@/types';
import { formatNumber } from '@/utils/format';

function Footer({
  text,
  className = 'text-on-surface-variant',
}: {
  text: string;
  className?: string;
}) {
  return <p className={`mt-4 font-body-sm text-body-sm ${className}`}>{text}</p>;
}

/** Thẻ số liệu hồ sơ đối tác (GET /admin/business-profiles/stats) */
export default function PartnerStatsCards({ stats }: { stats: PartnerStats }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t('partnerAdmin.stats.total')}
        value={formatNumber(stats.total)}
        icon="corporate_fare"
        iconClassName="bg-secondary-container text-on-secondary-container"
        footer={
          <div className="mt-4 flex items-center gap-1 font-label-sm text-label-sm font-semibold text-primary">
            <Icon name="trending_up" className="text-[16px]" />
            {t('partnerAdmin.stats.newThisMonth', { count: stats.newThisMonth })}
          </div>
        }
      />
      <StatCard
        label={t('partnerAdmin.stats.pending')}
        value={formatNumber(stats.pending)}
        icon="pending_actions"
        iconClassName="bg-tertiary-fixed text-on-tertiary-fixed"
        footer={
          <Footer
            text={t('partnerAdmin.stats.pendingHint')}
            className={stats.pending > 0 ? 'font-semibold text-tertiary' : undefined}
          />
        }
      />
      <StatCard
        label={t('partnerAdmin.stats.active')}
        value={formatNumber(stats.active)}
        icon="verified"
        iconClassName="bg-surface-container-high text-primary"
        footer={<Footer text={t('partnerAdmin.stats.activeHint')} />}
      />
      <StatCard
        label={t('partnerAdmin.stats.suspended')}
        value={formatNumber(stats.suspended)}
        icon="lock"
        iconClassName="bg-error-container text-on-error-container"
        footer={<Footer text={t('partnerAdmin.stats.rejectedHint', { count: stats.rejected })} />}
      />
    </div>
  );
}
