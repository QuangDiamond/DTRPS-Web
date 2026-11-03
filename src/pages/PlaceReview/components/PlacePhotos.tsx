import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { PlaceImage } from '@/types';

/** Ảnh bìa lớn + ảnh nhỏ; bấm để phóng to (←/→ chuyển ảnh, Esc đóng) */
export default function PlacePhotos({ images }: { images: PlaceImage[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  // Ảnh bìa đứng đầu
  const ordered = [...images].sort((a, b) => Number(b.primary) - Number(a.primary));

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(null);
      if (event.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % ordered.length));
      if (event.key === 'ArrowLeft')
        setOpen((i) => (i === null ? i : (i - 1 + ordered.length) % ordered.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, ordered.length]);

  if (ordered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low py-10 text-on-surface-variant">
        <Icon name="hide_image" className="text-[36px] text-outline" />
        <span className="font-body-sm text-body-sm">{t('placeReview.detail.noPhotos')}</span>
      </div>
    );
  }

  const [cover, ...rest] = ordered;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(0)}
        className="relative block w-full overflow-hidden rounded-xl"
      >
        <img src={cover.url} alt="" className="h-64 w-full object-cover md:h-80" />
        <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 font-label-sm text-label-sm text-on-primary">
          {t('placeReview.detail.cover')}
        </span>
      </button>
      {rest.length > 0 && (
        <div className="mt-2 grid grid-cols-4 gap-2 md:grid-cols-5">
          {rest.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setOpen(index + 1)}
              className="overflow-hidden rounded-lg"
            >
              <img src={image.url} alt="" className="h-20 w-full object-cover hover:opacity-90" />
            </button>
          ))}
        </div>
      )}

      {open !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <img
            src={ordered[open].url}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            aria-label={t('placeReview.detail.close')}
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <Icon name="close" />
          </button>
          {ordered.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t('placeReview.detail.previous')}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen((open - 1 + ordered.length) % ordered.length);
                }}
                className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                type="button"
                aria-label={t('placeReview.detail.next')}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen((open + 1) % ordered.length);
                }}
                className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <Icon name="chevron_right" />
              </button>
              <span className="absolute bottom-5 rounded-full bg-black/50 px-3 py-1 font-label-sm text-label-sm text-white">
                {open + 1} / {ordered.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}
