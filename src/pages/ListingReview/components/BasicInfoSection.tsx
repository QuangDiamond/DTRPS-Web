import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import type { Listing, ListingDetail } from '@/types';
import ReviewSection, { FieldLabel, READONLY_FIELD_CLASS } from './ReviewSection';

interface BasicInfoSectionProps {
  listing: Listing;
  detail: ListingDetail;
}

function IconField({
  icon,
  children,
  className = '',
}: {
  icon: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${READONLY_FIELD_CLASS} ${className}`}>
      <Icon name={icon} className="shrink-0 text-[19px] text-primary" />
      {children}
    </div>
  );
}

export default function BasicInfoSection({ listing, detail }: BasicInfoSectionProps) {
  const { t } = useTranslation();
  return (
    <ReviewSection
      number="01"
      title={t('listingReview.basicInfoSection.basicPlaceInformation')}
      subtitle={t('listingReview.basicInfoSection.crossCheckMarketingDetails')}
      badge={
        <span className="rounded-full border border-primary-fixed/60 bg-primary-fixed/20 px-3 py-1 text-[11.5px] font-bold text-on-primary-fixed-variant">
          {detail.categoryDetail}
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>{t('listingReview.basicInfoSection.registeredPlaceName')}</FieldLabel>
          <div className={`${READONLY_FIELD_CLASS} text-[15px] font-bold text-on-surface`}>
            {listing.name}
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel>{t('listingReview.basicInfoSection.ownerSDetailedDescription')}</FieldLabel>
          <div
            className={`${READONLY_FIELD_CLASS} p-3.5 text-[13px] leading-relaxed text-on-surface-variant`}
          >
            {detail.description}
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel>{t('listingReview.basicInfoSection.actualAddress')}</FieldLabel>
          <IconField icon="location_on" className="font-medium">
            <span>{detail.fullAddress}</span>
          </IconField>
        </div>

        <div>
          <FieldLabel>Hotline CSKH</FieldLabel>
          <IconField icon="call" className="font-mono font-bold">
            <span>{detail.hotline}</span>
          </IconField>
        </div>
        <div>
          <FieldLabel>{t('listingReview.basicInfoSection.bookingEmail')}</FieldLabel>
          <IconField icon="mail" className="font-medium">
            <span className="truncate">{detail.email}</span>
          </IconField>
        </div>
        <div>
          <FieldLabel>{t('listingReview.basicInfoSection.officialWebsite')}</FieldLabel>
          <IconField icon="language" className="font-medium">
            {detail.website ? (
              <a
                href={`https://${detail.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-bold text-primary hover:underline"
              >
                {detail.website}
              </a>
            ) : (
              <span className="text-outline">
                {t('listingReview.basicInfoSection.notProvided')}
              </span>
            )}
          </IconField>
        </div>
        <div>
          <FieldLabel>{detail.schedule.label}</FieldLabel>
          <IconField icon="schedule" className="text-[13px] font-medium">
            <span>{detail.schedule.value}</span>
          </IconField>
        </div>

        {detail.price && (
          <div className="md:col-span-2">
            <FieldLabel>{t('listingReview.basicInfoSection.referenceListingPrice')}</FieldLabel>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-fixed/80 bg-primary-fixed/20 px-4 py-3">
              <div className="flex items-center gap-2.5 text-[16px] font-bold text-primary">
                <Icon name="payments" className="text-[22px]" />
                <span>{detail.price.range}</span>
              </div>
              <span className="rounded-md border border-primary-fixed bg-surface-container-lowest px-3 py-1 text-[11.5px] font-bold text-on-primary-fixed-variant shadow-2xs">
                {detail.price.note}
              </span>
            </div>
          </div>
        )}
      </div>
    </ReviewSection>
  );
}
