import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import ListingMapInfoView from '@/components/listings/ListingMapInfoView';
import { LISTING_CATEGORY_CONFIG } from '@/constants/listing';
import {
  countFilledMapFields,
  getListingSubTypeIcon,
  getListingSubTypeLabel,
} from '@/constants/listingMap';
import type { Listing } from '@/types';
import ReviewSection, { FieldLabel, READONLY_FIELD_CLASS } from './ReviewSection';

/** 01 — Thông tin địa điểm: tên, địa chỉ + bộ trường riêng của loại dịch vụ (giống form đối tác điền) */
export default function MapInfoSection({ listing }: { listing: Listing }) {
  const { t } = useTranslation();
  const { filled, total } = countFilledMapFields(listing.category, listing.mapInfo);
  const complete = filled === total;

  return (
    <ReviewSection
      number="01"
      title={t('listingMap.section.title')}
      subtitle={t('listingMap.section.subtitle', {
        category: LISTING_CATEGORY_CONFIG[listing.category].label,
      })}
      badge={
        <span
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-bold ${
            complete
              ? 'border-primary-fixed/60 bg-primary-fixed/20 text-on-primary-fixed-variant'
              : 'border-tertiary-fixed bg-tertiary-fixed/50 text-on-tertiary-fixed'
          }`}
        >
          <Icon name={complete ? 'check_circle' : 'pending'} className="text-[14px]" />
          {t('listingMap.section.filled', { filled, total })}
        </span>
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>{t('listingMap.fields.placeName')}</FieldLabel>
          <div className={`${READONLY_FIELD_CLASS} text-[15px] font-bold text-on-surface`}>
            {listing.name}
          </div>
        </div>
        <div>
          <FieldLabel>{t('listingMap.fields.placeType')}</FieldLabel>
          <div
            className={`flex items-center gap-2 ${READONLY_FIELD_CLASS} text-[13.5px] font-semibold text-on-surface`}
          >
            <Icon name={getListingSubTypeIcon(listing)} className="text-[19px] text-primary" />
            {LISTING_CATEGORY_CONFIG[listing.category].label} • {getListingSubTypeLabel(listing)}
          </div>
        </div>
        <div className="md:col-span-2">
          <FieldLabel>{t('listingMap.fields.address')}</FieldLabel>
          <div
            className={`flex items-center gap-2 ${READONLY_FIELD_CLASS} text-[13.5px] font-medium text-on-surface`}
          >
            <Icon name="location_on" className="shrink-0 text-[19px] text-primary" />
            {listing.address}
          </div>
        </div>
      </div>
      <ListingMapInfoView category={listing.category} info={listing.mapInfo} />
    </ReviewSection>
  );
}
