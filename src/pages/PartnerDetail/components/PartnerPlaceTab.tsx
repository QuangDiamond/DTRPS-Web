import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import ListingMapInfoView from '@/components/listings/ListingMapInfoView';
import ListingStatusBadge from '@/components/listings/ListingStatusBadge';
import ListingThumb from '@/components/listings/ListingThumb';
import { LISTING_CATEGORY_CONFIG } from '@/constants/listing';
import { getListingSubTypeIcon, getListingSubTypeLabel } from '@/constants/listingMap';
import { listingReviewPath } from '@/constants/routes';
import type { Listing } from '@/types';

/** Tab Địa điểm đăng ký — địa điểm đối tác đưa lên bản đồ và thông tin du khách nhìn thấy */
export default function PartnerPlaceTab({ listings }: { listings: Listing[] }) {
  const { t } = useTranslation();

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
        <Icon name="add_location_alt" className="text-[40px] text-outline" />
        <span className="font-title-md text-title-md font-semibold text-on-surface">
          {t('partnerDetail.placeTab.emptyTitle')}
        </span>
        <span className="max-w-md font-body-sm text-body-sm text-on-surface-variant">
          {t('partnerDetail.placeTab.emptyDescription')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {listings.map((listing) => (
        <div key={listing.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <ListingThumb listing={listing} className="h-16 w-16 rounded-xl" />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {listing.name}
                  </h2>
                  <ListingStatusBadge status={listing.status} />
                </div>
                <span className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
                      LISTING_CATEGORY_CONFIG[listing.category].pillClass
                    }`}
                  >
                    <Icon name={getListingSubTypeIcon(listing)} className="text-[14px]" />
                    {LISTING_CATEGORY_CONFIG[listing.category].label} •{' '}
                    {getListingSubTypeLabel(listing)}
                  </span>
                  <span className="font-mono text-[12px] text-outline">{listing.id}</span>
                </span>
                <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="location_on" className="text-[16px] text-primary" />
                  {listing.address}
                </span>
              </div>
            </div>
            <Link
              to={listingReviewPath(listing.id)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              <Icon name="visibility" className="text-[18px]" />
              {t('partnerDetail.placeTab.viewDetails')}
            </Link>
          </div>

          <div className="mb-3 flex items-center gap-2 font-label-md text-label-md font-semibold text-on-surface">
            <Icon name="map" className="text-[18px] text-primary" />
            {t('listingMap.section.title')}
          </div>
          <ListingMapInfoView category={listing.category} info={listing.mapInfo} />
        </div>
      ))}
    </div>
  );
}
