import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { listingReviewPath, ROUTES } from '@/constants/routes';
import PlaceContentView, { Row, Section } from '@/pages/PlaceReview/components/PlaceContentView';
import { ListingStatusBadge } from '@/pages/PlaceReview/components/StatusBadges';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { placeCatalogService } from '@/services/placeCatalogService';
import type { CatalogPlaceDetail } from '@/types';
import { getErrorMessage } from '@/utils/error';
import CatalogStatusBadge from './components/CatalogStatusBadge';
import { placeCode, SOURCE_STYLE } from './placeCatalogUtils';

/** Chi tiết một địa điểm trong kho: /admin/locations/:id — chỉ xem */
export default function PlaceCatalogDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<CatalogPlaceDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    placeCatalogService
      .get(id)
      .then((next) => {
        if (!active) return;
        setDetail(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  if (error && !detail) {
    return (
      <ErrorState
        title={t('placeCatalog.detail.loadError')}
        message={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!detail) return <PageLoader />;

  const { place, content } = detail;
  const source = SOURCE_STYLE[place.source];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('placeCatalog.detail.back'), icon: 'location_on', to: ROUTES.POIS },
            { label: place.name },
          ]}
          title={place.name}
          titleBadge={<CatalogStatusBadge status={place.status} />}
          description={`${t('placeCatalog.detail.placeCode')}: ${placeCode(place.id)}`}
          actions={
            place.listingId ? (
              <Button
                icon="fact_check"
                onClick={() => navigate(listingReviewPath(place.listingId ?? ''))}
              >
                {t('placeCatalog.detail.openReview')}
              </Button>
            ) : undefined
          }
        />
      </div>

      <PlaceContentView
        place={content}
        aside={
          <Section icon="hub" title={t('placeCatalog.detail.sourceTitle')}>
            <dl>
              <Row
                label={t('placeCatalog.table.source')}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name={source.icon} className="text-[18px] text-primary" />
                    {t(source.labelKey)}
                  </span>
                }
              />
              {place.businessName && (
                <Row label={t('placeCatalog.detail.business')} value={place.businessName} />
              )}
              {place.listingStatus && (
                <Row
                  label={t('placeCatalog.detail.listingStatus')}
                  value={<ListingStatusBadge status={place.listingStatus} />}
                />
              )}
              <Row
                label={t('placeCatalog.detail.status')}
                value={<CatalogStatusBadge status={place.status} />}
              />
              <Row
                label={t('placeCatalog.detail.rating')}
                value={
                  place.rating === null
                    ? t('placeCatalog.table.noRating')
                    : `${place.rating} ★ · ${t('placeCatalog.table.reviews', { count: place.reviewCount })}`
                }
              />
              <Row label={t('placeCatalog.detail.created')} value={displayDate(place.createdAt)} />
              <Row label={t('placeCatalog.detail.updated')} value={displayDate(place.updatedAt)} />
            </dl>
            {place.source === 'admin' && (
              <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant">
                {t('placeCatalog.detail.adminPoi')}
              </p>
            )}
          </Section>
        }
      />
    </div>
  );
}
