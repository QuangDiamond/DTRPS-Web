import { useEffect } from 'react';
import Icon from '../../../components/common/Icon';
import type { ListingPhoto } from '../../../types/admin';

interface PhotoLightboxProps {
  photos: ListingPhoto[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}

/** Xem ảnh phóng to, chuyển ảnh bằng nút hoặc phím ← → */
export default function PhotoLightbox({ photos, index, onChange, onClose }: PhotoLightboxProps) {
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
    'absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-6"
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
        <div className="text-center text-white">
          <div className="text-[15px] font-bold">
            {index + 1}. {photo.caption}
          </div>
          <div className="font-mono text-[12px] text-slate-300">
            Ảnh {index + 1}/{photos.length}
            {photo.meta && ` • ${photo.meta}`}
          </div>
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className={`${navButtonClass} left-0`}
              title="Ảnh trước"
            >
              <Icon name="chevron_left" className="text-[26px]" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className={`${navButtonClass} right-0`}
              title="Ảnh sau"
            >
              <Icon name="chevron_right" className="text-[26px]" />
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
        title="Đóng (Esc)"
      >
        <Icon name="close" className="text-[22px]" />
      </button>
    </div>
  );
}
