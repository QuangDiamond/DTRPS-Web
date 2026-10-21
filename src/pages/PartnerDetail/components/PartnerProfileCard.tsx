import { Trans, useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import { PARTNER_STATUS_CONFIG } from '@/constants/partner';
import {
  formatPartnershipDuration,
  getTrustLevelKey,
} from '@/pages/PartnerDetail/partnerProfileUtils';
import type { Partner, PartnerProfile } from '@/types';
import { formatDate, formatNumber } from '@/utils/format';

interface PartnerProfileCardProps {
  partner: Partner;
  profile: PartnerProfile;
}

function MetaItem({
  icon,
  filled = false,
  children,
}: {
  icon: string;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
        <Icon name={icon} filled={filled} className="text-[15px]" />
      </span>
      {children}
    </div>
  );
}

export default function PartnerProfileCard({ partner, profile }: PartnerProfileCardProps) {
  const { t } = useTranslation();
  const status = PARTNER_STATUS_CONFIG[partner.status];
  const roundedRating = Math.round(partner.rating);

  const metrics = [
    {
      label: t('partnerDetail.partnerProfileCard.registeredPlaces'),
      icon: 'domain',
      value: formatNumber(partner.listings.total),
      unit: t('partnerDetail.partnerProfileCard.business'),
      boxClass: 'bg-surface-container-low',
      headClass: 'text-outline',
      valueClass: 'text-on-surface',
      unitClass: 'text-on-surface-variant',
    },
    {
      label: t('partnerDetail.partnerProfileCard.approved'),
      icon: 'check_circle',
      value: formatNumber(partner.listings.approved),
      unit: t('partnerDetail.partnerProfileCard.public'),
      boxClass: 'bg-secondary-container/30',
      headClass: 'font-semibold text-secondary',
      valueClass: 'text-secondary',
      unitClass: 'text-secondary',
    },
    {
      label: t('partnerDetail.partnerProfileCard.pendingApproval'),
      icon: 'pending',
      value: formatNumber(partner.listings.pending),
      unit: t('partnerDetail.partnerProfileCard.needsAction'),
      boxClass: 'bg-tertiary-fixed/40',
      headClass: 'font-semibold text-tertiary',
      valueClass: 'text-tertiary',
      unitClass: 'text-tertiary',
    },
    {
      label: t('partnerDetail.partnerProfileCard.aiSearchHits'),
      icon: 'manage_search',
      value: formatNumber(profile.aiSearchHits),
      unit: t('partnerDetail.partnerProfileCard.hits'),
      boxClass: 'bg-surface-container-low',
      headClass: 'text-outline',
      valueClass: 'text-on-surface',
      unitClass: 'font-semibold text-primary',
    },
  ];

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-6 pb-6 lg:flex-row">
        {/* Định danh */}
        <div className="flex min-w-0 items-start gap-5">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-container/10 text-primary shadow-inner">
              <Icon name="person" filled className="text-[42px]" />
            </div>
            <span className="absolute -right-1 -bottom-2 flex items-center gap-1 rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed shadow-sm">
              <Icon name="verified" filled className="text-[13px]" />
              <span>{profile.tierLabel}</span>
            </span>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-1.5 flex flex-wrap items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{partner.name}</h1>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold ${status.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                {status.filterLabel}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant">
                {t('partnerDetail.partnerProfileCard.mainBusiness', {
                  businessName: partner.businessName,
                })}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 font-body-sm text-body-sm text-on-surface-variant md:grid-cols-2 xl:grid-cols-3">
              <MetaItem icon="person" filled>
                <span>
                  <Trans
                    i18nKey="partnerDetail.partnerProfileCard.representative"
                    values={{ representative: partner.representative }}
                    components={{ c0: <strong className="font-label-md text-on-surface" /> }}
                  />
                </span>
              </MetaItem>
              <MetaItem icon="mail">
                <a
                  className="truncate text-on-surface hover:underline"
                  href={`mailto:${partner.email}`}
                >
                  {partner.email}
                </a>
              </MetaItem>
              <MetaItem icon="call">
                <span className="font-medium text-on-surface">{partner.phone}</span>
              </MetaItem>
              <MetaItem icon="badge">
                <span className="truncate">
                  MST: <strong className="text-on-surface">{partner.taxCode}</strong> (
                  {profile.taxIssuer})
                </span>
              </MetaItem>
              <MetaItem icon="calendar_today">
                <span>
                  <Trans
                    i18nKey="partnerDetail.partnerProfileCard.joined"
                    values={{
                      joinedAt: formatDate(partner.joinedAt),
                      joinedAt2: formatPartnershipDuration(partner.joinedAt),
                    }}
                    components={{ c0: <span className="font-medium text-primary" /> }}
                  />
                </span>
              </MetaItem>
              <MetaItem icon="location_on">
                <span className="truncate" title={profile.legal.headOffice}>
                  {profile.legal.headOffice}
                </span>
              </MetaItem>
            </div>
          </div>
        </div>

        {/* Chỉ số tín nhiệm AI */}
        <div className="flex w-full shrink-0 items-center justify-end gap-3 rounded-xl bg-surface-container-low p-4 lg:w-auto lg:flex-col">
          <div className="flex items-center gap-2">
            <Icon name="verified_user" className="text-[20px] text-primary" />
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
              {t('partnerDetail.partnerProfileCard.aiTrust')}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className={`font-display-sm text-display-sm font-bold ${
                profile.trustScore >= 75 ? 'text-primary' : 'text-error'
              }`}
            >
              {profile.trustScore}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">/100</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 font-label-sm text-label-sm ${
              profile.trustScore >= 75
                ? 'bg-primary-fixed text-on-primary-fixed'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            {t(getTrustLevelKey(profile.trustScore))}
          </span>
        </div>
      </div>

      {/* Chỉ số tổng quan */}
      <div className="grid grid-cols-2 gap-3 pt-6 md:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`flex flex-col justify-between rounded-xl p-3.5 ${metric.boxClass}`}
          >
            <div className={`mb-1 flex items-center justify-between ${metric.headClass}`}>
              <span className="font-label-sm text-label-sm">{metric.label}</span>
              <Icon name={metric.icon} className="text-[18px]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-headline-lg text-headline-lg font-bold ${metric.valueClass}`}>
                {metric.value}
              </span>
              <span className={`font-label-sm text-label-sm ${metric.unitClass}`}>
                {metric.unit}
              </span>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex flex-col justify-between rounded-xl bg-surface-container-low p-3.5 md:col-span-1">
          <div className="mb-1 flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm">
              {t('partnerDetail.partnerProfileCard.averageRating')}
            </span>
            <Icon name="star" filled className="text-[18px] text-tertiary-container" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
              {partner.rating > 0 ? partner.rating.toFixed(1) : '—'}
            </span>
            <div className="flex text-tertiary-container">
              {Array.from({ length: 5 }, (_, index) => (
                <Icon
                  key={index}
                  name="star"
                  filled={index < roundedRating}
                  className="text-[16px]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
