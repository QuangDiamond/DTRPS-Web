import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Icon } from '@/components/common';
import type { ListingPhoto } from '@/types';

interface PhotoLightboxProps {
  photos: ListingPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}

/** Xem ảnh phóng to, chuyển ảnh bằng nút hoặc phím ← → */
export default function PhotoLightbox({ photos, index, onChange, onClose }: PhotoLightboxProps) {
  const { t } = useTranslation();
  const photo = photos[index];
  const goTo = (next: number) => onChange((next + photos.length) % photos.length);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length);
      if (event.key === 'ArrowRight') onChange((index + 1) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, photos.length, onChange, onClose]);

  if (!photo) return null;

  const navButtonClass =
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/15 text-on-primary backdrop-blur-md transition-colors hover:bg-surface-container-lowest/30';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/90 p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-5xl flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.caption}
          className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
        />
        <div className="text-center text-on-primary">
          <div className="text-[15px] font-bold">
            {index + 1}. {photo.caption}
          </div>
          <div className="font-mono text-[12px] text-outline-variant">
            {t('listingReview.photoLightbox.photo', { value: index + 1, length: photos.length })}
            {photo.meta && ` • ${photo.meta}`}
          </div>
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className={`${navButtonClass} left-0`}
              title={t('listingReview.photoLightbox.previousPhoto')}
            >
              <Icon name="chevron_left" className="text-[26px]" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className={`${navButtonClass} right-0`}
              title={t('listingReview.photoLightbox.nextPhoto')}
            >
              <Icon name="chevron_right" className="text-[26px]" />
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/15 text-on-primary transition-colors hover:bg-surface-container-lowest/30"
        title={t('listingReview.photoLightbox.closeEsc')}
      >
        <Icon name="close" className="text-[22px]" />
      </button>
    </div>
  );
}
