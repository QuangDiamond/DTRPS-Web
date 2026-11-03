import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components/common';
import { placeCatalogService } from '@/services/placeCatalogService';
import { getErrorMessage } from '@/utils/error';
import {
  ACCEPTED_IMAGE_TYPES,
  INPUT_CLASS,
  isHttpsUrl,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
} from '@/pages/PlaceCatalog/placeEditorUtils';

export interface PhotoItem {
  /** id ảnh (trang chi tiết) hoặc URL (form tạo mới) */
  key: string;
  url: string;
  primary: boolean;
}

/**
 * Ảnh địa điểm: thêm bằng URL https hoặc chọn ảnh trong máy (tải lên Cloudinary), xoá, đặt ảnh chính.
 * Form tạo mới giữ ảnh trong state; trang chi tiết gọi API ngay cho từng thao tác.
 */
export default function PhotoManager({
  images,
  onAdd,
  onRemove,
  onSetCover,
  onUploadingChange,
}: {
  images: PhotoItem[];
  /** Ném lỗi để hiện thông báo (ví dụ ảnh trùng) */
  onAdd: (url: string) => Promise<void> | void;
  onRemove: (item: PhotoItem) => Promise<void> | void;
  onSetCover: (item: PhotoItem) => Promise<void> | void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);

  const full = images.length >= MAX_IMAGES;

  const run = async (key: string, action: () => Promise<void> | void) => {
    setError('');
    setBusyKey(key);
    try {
      await action();
      return true;
    } catch (actionError) {
      setError(getErrorMessage(actionError));
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const addUrl = async () => {
    const value = url.trim();
    if (!isHttpsUrl(value)) {
      setError(t('placeEditor.photos.httpsOnly'));
      return;
    }
    if (await run('url', () => onAdd(value))) setUrl('');
  };

  const changeUploading = (delta: number) =>
    setUploading((current) => {
      const next = current + delta;
      onUploadingChange?.(next > 0);
      return next;
    });

  const uploadFiles = async (files: File[]) => {
    setError('');
    const room = MAX_IMAGES - images.length;
    if (files.length > room) setError(t('placeEditor.photos.tooMany', { count: room }));
    for (const file of files.slice(0, Math.max(room, 0))) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(t('placeEditor.photos.badType'));
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(t('placeEditor.photos.tooLarge'));
        continue;
      }
      changeUploading(1);
      try {
        const uploaded = await placeCatalogService.uploadImage(file);
        await onAdd(uploaded);
      } catch (uploadError) {
        setError(getErrorMessage(uploadError));
      } finally {
        changeUploading(-1);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.key}
            className="overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest"
          >
            <div className="relative">
              <img src={image.url} alt="" className="h-28 w-full object-cover" />
              {image.primary && (
                <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 font-label-sm text-[10px] font-bold text-on-primary">
                  {t('placeEditor.photos.cover')}
                </span>
              )}
              {busyKey === image.key && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/60 border-t-primary" />
                </span>
              )}
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <button
                type="button"
                disabled={image.primary || busyKey !== null}
                onClick={() => void run(image.key, () => onSetCover(image))}
                className="font-label-sm text-[11px] font-bold text-primary hover:underline disabled:text-outline disabled:no-underline"
              >
                {image.primary ? t('placeEditor.photos.isCover') : t('placeEditor.photos.setCover')}
              </button>
              <button
                type="button"
                aria-label={t('placeEditor.photos.remove')}
                disabled={busyKey !== null}
                onClick={() => void run(image.key, () => onRemove(image))}
                className="text-outline hover:text-error disabled:opacity-40"
              >
                <Icon name="delete" className="text-[18px]" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, index) => (
          <div
            key={`uploading-${index}`}
            className="flex h-[9.25rem] flex-col items-center justify-center gap-2 rounded-xl border border-surface-container bg-surface-container-low"
          >
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-outline/40 border-t-primary" />
            <span className="font-label-sm text-label-sm text-outline">
              {t('placeEditor.photos.uploading')}
            </span>
          </div>
        ))}
        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[9.25rem] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low text-outline transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="add_photo_alternate" className="text-[32px]" />
            <span className="font-label-sm text-label-sm font-bold">
              {t('placeEditor.photos.pickFile')}
            </span>
          </button>
        )}
      </div>

      {!full && (
        <div className="flex flex-wrap gap-2">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void addUrl();
              }
            }}
            placeholder={t('placeEditor.photos.urlPlaceholder')}
            className={`${INPUT_CLASS} min-w-0 flex-1`}
          />
          <Button
            variant="secondary"
            icon="link"
            loading={busyKey === 'url'}
            disabled={!url.trim()}
            onClick={() => void addUrl()}
          >
            {t('placeEditor.photos.addUrl')}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) void uploadFiles(Array.from(event.target.files));
          event.target.value = '';
        }}
      />
      <p className="font-label-sm text-label-sm text-outline">
        {t('placeEditor.photos.hint', { count: images.length, max: MAX_IMAGES })}
      </p>
      {error && <p className="font-label-sm text-label-sm text-error">{error}</p>}
    </div>
  );
}
