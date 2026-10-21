import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { Listing, ListingChecklistItem, ListingDetail } from '@/types';
import { REVIEW_CARD_CLASS } from './ReviewSection';

interface PartnerChecklistCardProps {
  listing: Listing;
  detail: ListingDetail;
  checklist: ListingChecklistItem[];
  editable: boolean;
  onToggleCheck: (id: string) => void;
}

export default function PartnerChecklistCard({
  listing,
  detail,
  checklist,
  editable,
  onToggleCheck,
}: PartnerChecklistCardProps) {
  const { t } = useTranslation();
  const { partner } = detail;
  const passedCount = checklist.filter((item) => item.passed).length;
  const allPassed = passedCount === checklist.length;

  const stats = [
    {
      value: partner.yearsActive,
      label: t('listingReview.partnerChecklistCard.active'),
      className: 'text-on-surface',
    },
    {
      value: `${partner.approvedCount} POI`,
      label: t('listingReview.partnerChecklistCard.approved'),
      className: 'text-primary',
    },
    {
      value: partner.responseRate,
      label: t('listingReview.partnerChecklistCard.response'),
      className: 'text-secondary',
    },
  ];

  return (
    <div className={REVIEW_CARD_CLASS}>
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11px] font-extrabold tracking-wider text-on-surface-variant uppercase">
          {t('listingReview.partnerChecklistCard.submittingOrganization')}
        </span>
        {partner.verified ? (
          <span className="rounded-full border border-secondary-fixed-dim/50 bg-secondary-container/30 px-2.5 py-0.5 text-[11px] font-bold text-on-secondary-fixed-variant">
            {t('listingReview.partnerChecklistCard.verifiedPartner')}
          </span>
        ) : (
          <span className="rounded-full border border-tertiary-fixed bg-tertiary-fixed/30 px-2.5 py-0.5 text-[11px] font-bold text-on-tertiary-fixed-variant">
            {t('listingReview.partnerChecklistCard.newPartner')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Icon name="business" className="text-[26px]" />
          </div>
          <div>
            <h3 className="text-[15px] leading-snug font-bold text-on-surface">
              {listing.partnerName}
            </h3>
            <p className="text-[12px] font-medium text-on-surface-variant">
              <Trans
                i18nKey="listingReview.partnerChecklistCard.representative"
                values={{ code: partner.code, representative: partner.representative }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-[10.5px] font-bold text-on-surface-variant uppercase">
            {t('listingReview.partnerChecklistCard.partnerHotline')}
          </span>
          <span className="block font-mono text-[12.5px] font-bold text-primary">
            {partner.hotline}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-b border-surface-container py-3 text-center">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-surface-container bg-surface-container-low p-2"
          >
            <div className={`truncate text-[15px] font-bold ${stat.className}`}>{stat.value}</div>
            <div className="text-[10.5px] font-medium text-on-surface-variant">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Checklist kiểm định */}
      <div className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="fact_check" className="text-[19px] text-primary" />
            <h4 className="text-[13px] font-bold text-on-surface">
              {t('listingReview.partnerChecklistCard.standardInspectionChecklist')}
            </h4>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
              allPassed
                ? 'border-primary-fixed bg-primary-fixed/40 text-on-primary-fixed-variant'
                : 'border-tertiary-fixed bg-tertiary-fixed/60 text-on-tertiary-fixed'
            }`}
          >
            {t('listingReview.partnerChecklistCard.passed', {
              passedCount,
              length: checklist.length,
            })}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!editable}
              onClick={() => onToggleCheck(item.id)}
              title={
                editable ? t('listingReview.partnerChecklistCard.clickMarkAsPassed') : undefined
              }
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-colors disabled:cursor-default ${
                item.passed
                  ? 'border-secondary-fixed-dim/50 bg-secondary-container/30'
                  : 'border-surface-container-high bg-surface-container-low hover:border-outline-variant'
              }`}
            >
              <Icon
                name={item.passed ? 'check_circle' : 'radio_button_unchecked'}
                filled={item.passed}
                className={`shrink-0 text-[18px] ${item.passed ? 'text-secondary' : 'text-outline'}`}
              />
              <span className="truncate font-semibold text-on-surface">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
