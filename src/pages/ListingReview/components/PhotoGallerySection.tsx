import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Icon } from '@/components/common';
import type { ListingDetail } from '@/types';
import PhotoLightbox from './PhotoLightbox';
import ReviewSection from './ReviewSection';

export default function PhotoGallerySection({ detail }: { detail: ListingDetail }) {
  const { t } = useTranslation();
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [cover, ...others] = detail.photos;
  const uploaded = detail.photos.length;
  const isComplete = uploaded >= detail.requiredPhotoCount;

  return (
    <ReviewSection
      number="03"
      title={t('listingReview.photoGallerySection.photosUploadedByPartner')}
      subtitle={t('listingReview.photoGallerySection.checkDisplayQualityReal')}
      badge={
        <span
          className={`rounded-full border px-3 py-1 text-[11.5px] font-bold ${
            isComplete
              ? 'border-secondary-fixed-dim/50 bg-secondary-container/30 text-on-secondary-fixed-variant'
              : 'border-tertiary-fixed bg-tertiary-fixed/30 text-on-tertiary-fixed-variant'
          }`}
        >
          {t('listingReview.photoGallerySection.uploadedStandardPhotos', {
            uploaded,
            requiredPhotoCount: detail.requiredPhotoCount,
          })}
        </span>
      }
    >
      {cover ? (
        <div className="grid grid-cols-12 gap-3.5">
          {/* Ảnh bìa */}
          <button
            type="button"
            onClick={() => setViewingIndex(0)}
            className="group relative col-span-12 h-56 overflow-hidden rounded-xl border border-surface-container-high text-left shadow-2xs md:col-span-5"
          >
            <img
              src={cover.url}
              alt={cover.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent" />
            <div className="absolute top-2.5 left-2.5">
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-bold tracking-wider text-on-primary uppercase shadow-sm">
                {t('listingReview.photoGallerySection.coverPhoto')}
              </span>
            </div>
            <div className="absolute right-3 bottom-2.5 left-3 text-on-primary">
              <div className="truncate text-[13px] font-bold">{cover.caption}</div>
              <div className="mt-0.5 flex items-center justify-between font-mono text-[11px] text-outline-variant">
                <span>
                  {cover.meta ?? t('listingReview.photoGallerySection.partnerUploadedPhoto')}
                </span>
                <span className="flex items-center gap-0.5 font-bold text-secondary-fixed-dim">
                  <Icon name="check_circle" className="text-[13px]" />{' '}
                  {t('listingReview.photoGallerySection.valid')}
                </span>
              </div>
            </div>
          </button>

          {/* Ảnh chi tiết */}
          <div className="col-span-12 grid grid-cols-3 gap-2.5 md:col-span-7">
            {others.map((photo, index) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setViewingIndex(index + 1)}
                className="group relative h-[106px] overflow-hidden rounded-xl border border-surface-container-high text-left"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-inverse-surface/75 via-transparent to-transparent" />
                <span className="absolute right-1.5 bottom-1 left-1.5 truncate text-[10px] font-bold text-on-primary">
                  {index + 1}. {photo.caption}
                </span>
              </button>
            ))}
            {others.length === 0 && (
              <div className="col-span-3 flex h-full min-h-[106px] items-center justify-center rounded-xl border border-dashed border-outline-variant text-[12px] text-outline">
                {t('listingReview.photoGallerySection.thePartnerHasNot')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant text-outline">
          <Icon name="hide_image" className="text-[32px]" />
          <span className="text-[12.5px] font-medium">
            {t('listingReview.photoGallerySection.thePartnerHasNot2')}
          </span>
        </div>
      )}

      {viewingIndex !== null && (
        <PhotoLightbox
          photos={detail.photos}
          index={viewingIndex}
          onChange={setViewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}
    </ReviewSection>
  );
}
