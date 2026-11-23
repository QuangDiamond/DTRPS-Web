import { useEffect } from 'react';
import Icon from './Icon';

export interface LightboxPhoto {
  url: string;
  primary?: boolean;
}

/**
 * Hộp thoại phóng to xem ảnh dùng chung cho cả Admin và Partner:
 * hỗ trợ phím Esc, mũi tên trái/phải, và hàng thumbnail nhảy nhanh khi có nhiều ảnh.
 */
export default function PhotoLightbox({
  photos,
  index,
  onChange,
  onClose,
  coverLabel = 'Ảnh chính',
}: {
  photos: LightboxPhoto[];
  index: number;
  onChange: (next: number) => void;
  onClose: () => void;
  coverLabel?: string;
}) {
  const safeIndex = Math.min(Math.max(index, 0), Math.max(photos.length - 1, 0));
  const current = photos[safeIndex];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (photos.length > 1 && event.key === 'ArrowLeft') {
        onChange((safeIndex - 1 + photos.length) % photos.length);
      }
      if (photos.length > 1 && event.key === 'ArrowRight') {
        onChange((safeIndex + 1) % photos.length);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onChange, onClose, photos.length, safeIndex]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh phóng to"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-xs"
    >
      {/* Thanh trên: số thứ tự + nhãn ảnh chính + nút đóng */}
      <div
        onClick={(event) => event.stopPropagation()}
        className="mb-3 flex w-full max-w-5xl items-center justify-between gap-3 text-white"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tabular-nums">
            {safeIndex + 1} / {photos.length}
          </span>
          {current.primary && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-on-primary">
              {coverLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <Icon name="close" className="text-[22px]" />
        </button>
      </div>

      {/* Khung ảnh phóng to + nút chuyển trái/phải */}
      <div className="relative flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center">
        {photos.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange((safeIndex - 1 + photos.length) % photos.length);
            }}
            aria-label="Ảnh trước"
            className="absolute left-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 md:left-3"
          >
            <Icon name="chevron_left" className="text-[28px]" />
          </button>
        )}

        <img
          src={current.url}
          alt=""
          referrerPolicy="no-referrer"
          onClick={(event) => event.stopPropagation()}
          className="max-h-[72vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl"
        />

        {photos.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange((safeIndex + 1) % photos.length);
            }}
            aria-label="Ảnh tiếp theo"
            className="absolute right-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 md:right-3"
          >
            <Icon name="chevron_right" className="text-[28px]" />
          </button>
        )}
      </div>

      {/* Hàng thumbnail nhỏ phía dưới khi có từ 2 ảnh trở lên */}
      {photos.length > 1 && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="mt-4 flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-black/50 p-2"
        >
          {photos.map((photo, idx) => (
            <button
              key={`${photo.url}-${idx}`}
              type="button"
              onClick={() => onChange(idx)}
              aria-label={`Xem ảnh ${idx + 1}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${
                idx === safeIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-55 hover:opacity-90'
              }`}
            >
              <img
                src={photo.url}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
