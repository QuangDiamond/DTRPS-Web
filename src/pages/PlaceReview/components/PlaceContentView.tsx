import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  DAY_KEYS,
  formatAmount,
  googleMapsUrl,
  hourText,
  mapEmbedUrl,
  priceTypeLabel,
} from '@/pages/PlaceReview/placeReviewUtils';
import type { PlaceContent } from '@/types';
import PlacePhotos from './PlacePhotos';

export function Section({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
        <Icon name={icon} className="text-[22px] text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-t border-surface-container py-3 first:border-t-0">
      <dt className="shrink-0 font-body-md text-body-md text-on-surface-variant">{label}</dt>
      <dd className="text-right font-body-md text-body-md font-semibold break-words text-on-surface">
        {value}
      </dd>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="font-body-sm text-body-sm text-outline italic">{text}</p>;
}

/** Toàn bộ nội dung một địa điểm: ảnh, mô tả, giờ mở cửa, giá, thông tin & bản đồ */
export default function PlaceContentView({
  place,
  aside,
  editors,
}: {
  place: PlaceContent;
  /** Khối thêm ở cột phải (doanh nghiệp, xét duyệt…) */
  aside?: ReactNode;
  /** Thay phần ảnh / giờ / giá chỉ xem bằng khối chỉnh sửa (địa điểm do admin tạo) */
  editors?: { photos: ReactNode; hours: ReactNode; prices: ReactNode };
}) {
  const { t } = useTranslation();
  const closed = t('placeReview.detail.closed');

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="flex flex-col gap-6 xl:col-span-7">
        {editors ? (
          editors.photos
        ) : (
          <Section icon="photo_library" title={t('placeReview.detail.photos')}>
            <PlacePhotos images={place.images} />
          </Section>
        )}

        <Section icon="description" title={t('placeReview.detail.description')}>
          {place.description ? (
            <p className="font-body-md text-body-md whitespace-pre-line text-on-surface">
              {place.description}
            </p>
          ) : (
            <Empty text={t('placeReview.detail.noDescription')} />
          )}
        </Section>

        {editors ? (
          <>
            {editors.hours}
            {editors.prices}
          </>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Section icon="schedule" title={t('placeReview.detail.hours')}>
              {place.openingHours.length === 0 ? (
                <Empty text={t('placeReview.detail.noHours')} />
              ) : (
                <dl>
                  {place.openingHours.map((hour) => (
                    <Row
                      key={hour.dayOfWeek}
                      label={t(DAY_KEYS[hour.dayOfWeek])}
                      value={
                        <span className={hour.closed ? 'text-error' : undefined}>
                          {hourText(hour, closed)}
                        </span>
                      }
                    />
                  ))}
                </dl>
              )}
            </Section>

            <Section icon="payments" title={t('placeReview.detail.prices')}>
              {place.prices.length === 0 ? (
                <Empty text={t('placeReview.detail.noPrices')} />
              ) : (
                <dl>
                  {place.prices.map((price, index) => (
                    <Row
                      key={`${price.priceType}-${index}`}
                      label={price.description ?? priceTypeLabel(price.priceType)}
                      value={formatAmount(price)}
                    />
                  ))}
                </dl>
              )}
            </Section>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 xl:col-span-5">
        <Section icon="storefront" title={t('placeReview.detail.info')}>
          <dl>
            <Row label={t('placeReview.detail.group')} value={place.group?.name ?? '—'} />
            <Row label={t('placeReview.detail.category')} value={place.category?.name ?? '—'} />
            <Row label={t('placeReview.detail.province')} value={place.province?.name ?? '—'} />
            <Row label={t('placeReview.detail.address')} value={place.address} />
            <Row label={t('placeReview.detail.phone')} value={place.phone ?? '—'} />
            <Row
              label={t('placeReview.detail.website')}
              value={
                place.website ? (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {place.website}
                  </a>
                ) : (
                  '—'
                )
              }
            />
          </dl>
          <div className="mt-3 overflow-hidden rounded-xl border border-surface-container">
            <iframe
              title={t('placeReview.detail.coordinates')}
              src={mapEmbedUrl(place)}
              className="h-56 w-full"
              loading="lazy"
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-body-sm text-body-sm">
            <span className="text-on-surface-variant tabular-nums">
              {place.latitude}, {place.longitude}
            </span>
            <a
              href={googleMapsUrl(place)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <Icon name="open_in_new" className="text-[16px]" />
              {t('placeReview.detail.openMap')}
            </a>
          </div>
        </Section>
        {aside}
      </div>
    </div>
  );
}
