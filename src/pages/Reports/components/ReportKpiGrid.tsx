import { Trans, useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import { formatSigned, type ReportTotals } from '@/pages/Reports/reportUtils';
import type { ReportKpis } from '@/types';
import { formatNumber } from '@/utils/format';

interface ReportKpiGridProps {
  kpis: ReportKpis;
  totals: ReportTotals;
  /** Tổng chuyến đi cả năm của phạm vi lọc — để tính bình quân chuyến/người */
  tripsPerYear: number;
}

interface KpiConfig {
  label: string;
  icon: string;
  iconClass: string;
  value: string;
  note: ReactNode;
  barClass: string;
  /** Độ dài thanh tiến độ (0 - 100) */
  progress: number;
}

const clampPercent = (value: number) => Math.max(4, Math.min(100, value));

function TrendNote({ icon, text, className }: { icon: string; text: string; className: string }) {
  return (
    <div className={`mt-1 flex items-center gap-1 ${className}`}>
      <Icon name={icon} className="text-[16px]" />
      <span className="font-label-sm text-[12px] font-bold">{text}</span>
    </div>
  );
}

export default function ReportKpiGrid({ kpis, totals, tripsPerYear }: ReportKpiGridProps) {
  const { t } = useTranslation();
  const activeShare = totals.users === 0 ? 0 : (kpis.monthlyActiveUsers / totals.users) * 100;
  const tripsPerUser = totals.users === 0 ? 0 : tripsPerYear / totals.users;
  const growthUp = kpis.userGrowthYoY >= 0;
  const partnerUp = kpis.partnerGrowthQoQ >= 0;

  const cards: KpiConfig[] = [
    {
      label: t('reports.reportKpiGrid.totalUsers'),
      icon: 'group',
      iconClass: 'bg-primary/10 text-primary',
      value: formatNumber(totals.users),
      note: (
        <TrendNote
          icon={growthUp ? 'trending_up' : 'trending_down'}
          text={`${formatSigned(kpis.userGrowthYoY)} YoY`}
          className={growthUp ? 'text-primary' : 'text-error'}
        />
      ),
      barClass: 'bg-primary',
      progress: 78,
    },
    {
      label: t('reports.reportKpiGrid.monthlyActiveUsersMau'),
      icon: 'person_check',
      iconClass: 'bg-secondary-container text-on-secondary-container',
      value: formatNumber(kpis.monthlyActiveUsers),
      note: (
        <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
          <span className="font-body-sm text-[12px]">
            <Trans
              i18nKey="reports.reportKpiGrid.ofUsers"
              values={{ toFixed: activeShare.toFixed(1) }}
              components={{ c0: <strong className="font-semibold text-primary" /> }}
            />
          </span>
        </div>
      ),
      barClass: 'bg-secondary',
      progress: activeShare,
    },
    {
      label: t('reports.reportKpiGrid.tripsCreated'),
      icon: 'route',
      iconClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      value: formatNumber(kpis.tripsCreated),
      note: (
        <div className="mt-1 flex items-center gap-1 text-tertiary">
          <span className="font-body-sm text-[12px] font-semibold">
            {t('reports.reportKpiGrid.avgTripsUser', { toFixed: tripsPerUser.toFixed(1) })}
          </span>
        </div>
      ),
      barClass: 'bg-tertiary',
      progress: 84,
    },
    {
      label: t('reports.reportKpiGrid.aiQueries'),
      icon: 'manage_search',
      iconClass: 'bg-primary/10 text-primary',
      value: formatNumber(kpis.aiQueries),
      note: (
        <div className="mt-1 flex items-center gap-1 text-primary">
          <span className="font-body-sm text-[12px] font-semibold">
            {t('reports.reportKpiGrid.aiHitRate', { rate: kpis.aiHitRate })}
          </span>
        </div>
      ),
      barClass: 'bg-primary',
      progress: kpis.aiHitRate,
    },
    {
      label: t('reports.reportKpiGrid.aiAvgSimilarity'),
      icon: 'hub',
      iconClass: 'bg-secondary-container text-on-secondary-container',
      value: `${kpis.aiAvgSimilarity}%`,
      note: (
        <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
          <span className="font-body-sm text-[12px]">{t('reports.reportKpiGrid.aiTop1Note')}</span>
        </div>
      ),
      barClass: 'bg-secondary',
      progress: kpis.aiAvgSimilarity,
    },
    {
      label: t('reports.reportKpiGrid.businessPartners'),
      icon: 'handshake',
      iconClass: 'bg-primary-fixed text-on-primary-fixed',
      value: formatNumber(totals.partners),
      note: (
        <TrendNote
          icon={partnerUp ? 'arrow_outward' : 'south_east'}
          text={`${formatSigned(kpis.partnerGrowthQoQ)} Q/Q`}
          className={partnerUp ? 'text-primary' : 'text-error'}
        />
      ),
      barClass: 'bg-primary-container',
      progress: 70,
    },
    {
      label: t('reports.reportKpiGrid.totalPoiPlaces'),
      icon: 'explore',
      iconClass: 'bg-surface-container-high text-on-surface',
      value: formatNumber(totals.pois),
      note: (
        <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
          <span className="font-body-sm text-[12px]">
            {t('reports.reportKpiGrid.provincesCities', {
              provincesCovered: kpis.provincesCovered,
            })}
          </span>
        </div>
      ),
      barClass: 'bg-on-surface-variant',
      progress: 88,
    },
    {
      label: t('reports.reportKpiGrid.listingApprovalRate'),
      icon: 'verified',
      iconClass: 'bg-secondary-container text-on-secondary-container',
      value: `${totals.approvalRate}%`,
      note: (
        <div className="mt-1 flex items-center gap-1 font-label-sm text-[11px] font-medium text-on-secondary-container">
          <Icon name="timer" className="text-[14px]" />
          <span>
            {t('reports.reportKpiGrid.avgReviewHrs', { avgApprovalHours: kpis.avgApprovalHours })}
          </span>
        </div>
      ),
      barClass: 'bg-secondary',
      progress: totals.approvalRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex flex-col justify-between rounded-2xl border border-surface-container/80 bg-surface-container-lowest p-4 shadow-xs transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-label-sm text-[12px] font-medium text-on-surface-variant">
              {card.label}
            </span>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconClass}`}
            >
              <Icon name={card.icon} className="text-[19px]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="block font-display-sm text-[24px] font-bold tracking-tight text-on-surface">
              {card.value}
            </span>
            {card.note}
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className={`h-full rounded-full ${card.barClass}`}
              style={{ width: `${clampPercent(card.progress)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
