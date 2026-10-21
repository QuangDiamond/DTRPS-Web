import { Trans, useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import type { UserProfile } from '@/types';
import { formatNumber } from '@/utils/format';

interface MetricCardProps {
  label: string;
  icon: string;
  iconClass: string;
  iconFilled?: boolean;
  value: string;
  unit: string;
  unitClass?: string;
  footer: ReactNode;
}

function MetricCard({
  label,
  icon,
  iconClass,
  iconFilled,
  value,
  unit,
  unitClass,
  footer,
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
          {label}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>
          <Icon name={icon} filled={iconFilled} className="text-[22px]" />
        </div>
      </div>
      <div className="mt-space-md">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display-lg text-display-lg font-bold text-on-surface">{value}</span>
          <span
            className={`font-title-md text-title-md ${unitClass ?? 'font-medium text-on-surface-variant'}`}
          >
            {unit}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function UserMetricCards({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={t('userDetail.userMetricCards.tripsCreated')}
        icon="route"
        iconClass="bg-surface-container text-primary"
        value={formatNumber(profile.tripSummary.total)}
        unit={t('userDetail.userMetricCards.itineraries')}
        footer={
          <>
            <span className="font-semibold text-primary">
              {t('userDetail.userMetricCards.completed', {
                completed: profile.tripSummary.completed,
              })}
            </span>
            <span>•</span>
            <span className="font-semibold text-tertiary">
              {t('userDetail.userMetricCards.upcoming', { upcoming: profile.tripSummary.upcoming })}
            </span>
          </>
        }
      />
      <MetricCard
        label={t('userDetail.userMetricCards.favoritePlacesSaved')}
        icon="bookmark"
        iconFilled
        iconClass="bg-secondary-container/50 text-secondary"
        value={formatNumber(profile.savedPois)}
        unit={t('userDetail.userMetricCards.savedPois')}
        footer={
          <>
            <Icon name="share_location" className="text-[16px] text-primary" />
            <span>{profile.savedNote}</span>
          </>
        }
      />
      <MetricCard
        label={t('userDetail.userMetricCards.ratingsReviews')}
        icon="reviews"
        iconClass="bg-tertiary-fixed/60 text-tertiary"
        value={formatNumber(profile.reviewCount)}
        unit={t('userDetail.userMetricCards.reviews')}
        footer={
          <>
            <Icon name="star" filled className="text-[16px] text-tertiary" />
            <span>
              <Trans
                i18nKey="userDetail.userMetricCards.averageScore50"
                values={{ toFixed: profile.avgRating.toFixed(1) }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </span>
          </>
        }
      />
      <MetricCard
        label={t('userDetail.userMetricCards.spendingPlatform')}
        icon="payments"
        iconClass="bg-surface-container text-primary"
        value={formatNumber(profile.totalSpend)}
        unit={t('userDetail.userMetricCards.vnd')}
        unitClass="font-bold text-primary"
        footer={
          <>
            <Icon name="hotel" className="text-[16px] text-primary" />
            <span>{profile.spendNote}</span>
          </>
        }
      />
    </div>
  );
}
