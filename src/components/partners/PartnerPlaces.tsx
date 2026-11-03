import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { listingReviewPath } from '@/constants/routes';
import { ListingStatusBadge } from '@/pages/PlaceReview/components/StatusBadges';
import { coverOf, displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { listingReviewService } from '@/services/listingReviewService';
import type { ReviewListing } from '@/types';
import { getErrorMessage } from '@/utils/error';

const MAX_PLACES = 100;

/** Các địa điểm của một đối tác (một đối tác có thể có nhiều địa điểm) — trên trang chi tiết đối tác */
export default function PartnerPlaces({ businessId }: { businessId: string }) {
  const { t } = useTranslation();
  const [places, setPlaces] = useState<ReviewListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listingReviewService
      .listListings({ status: 'all', keyword: '', businessId, page: 0, size: MAX_PLACES })
      .then((page) => {
        if (!active) return;
        setPlaces(page.items);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [businessId]);

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="flex items-center justify-between gap-2 font-headline-sm text-headline-sm text-on-surface">
        <span className="flex items-center gap-2">
          <Icon name="location_on" className="text-[22px] text-primary" />
          {t('partnerAdmin.detail.placeTitle')}
        </span>
        {places && places.length > 0 && (
          <span className="font-label-md text-label-md text-on-surface-variant">
            {t('partnerAdmin.detail.placeCount', { count: places.length })}
          </span>
        )}
      </h2>
      {error ? (
        <p className="font-body-md text-body-md text-error">
          {t('partnerAdmin.detail.placeLoadError')}: {error}
        </p>
      ) : !places ? (
        <p className="font-body-md text-body-md text-on-surface-variant">…</p>
      ) : places.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t('partnerAdmin.detail.placeSoon')}
        </p>
      ) : (
        <ul className="divide-y divide-surface-container">
          {places.map((place) => (
            <li key={place.id}>
              <Link
                to={listingReviewPath(place.id)}
                className="flex items-center gap-3 py-3 hover:bg-surface-container-low/60"
              >
                {coverOf(place) ? (
                  <img
                    src={coverOf(place)}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-outline">
                    <Icon name="image" className="text-[20px]" />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-title-md text-title-md text-on-surface">
                    {place.name}
                  </span>
                  <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                    {[place.category?.name, place.province?.name].filter(Boolean).join(' · ')} ·{' '}
                    {displayDate(place.updatedAt)}
                  </span>
                </span>
                <ListingStatusBadge status={place.status} />
                <Icon name="chevron_right" className="text-[20px] text-outline" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
