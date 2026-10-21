import { useTranslation } from 'react-i18next';
import { type ChangeEvent, useRef } from 'react';
import { Icon } from '@/components/common';
import { POI_MAX_PHOTOS } from '@/constants/poi';
import { useToast } from '@/hooks';
import {
  captionFromFileName,
  type PoiFieldChange,
  readPhotoFile,
  totalPhotos,
} from '@/pages/PoiEditor/poiFormUtils';
import type { PoiFormValues, PoiPhoto } from '@/types';
import PoiSectionCard from './PoiSectionCard';

const MIN_WIDTH = 1920;
const MIN_HEIGHT = 1080;
const ACCEPTED_TYPES = 'image/webp,image/jpeg,image/png';

interface PoiMediaSectionProps {
  values: PoiFormValues;
  uploader: string;
  onChange: PoiFieldChange;
  onPreview: (photo: PoiPhoto) => void;
}

export default function PoiMediaSection({
  values,
  uploader,
  onChange,
  onPreview,
}: PoiMediaSectionProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { cover, gallery } = values;
  const photoCount = totalPhotos(values);
  const isFull = photoCount >= POI_MAX_PHOTOS;

  const warnLowResolution = (photos: { caption: string; width: number; height: number }[]) => {
    const small = photos.filter((photo) => photo.width < MIN_WIDTH || photo.height < MIN_HEIGHT);
    if (small.length > 0) {
      showToast(
        t('poiEditor.poiMediaSection.photosBelowXPx', {
          count: small.length,
          MIN_WIDTH,
          MIN_HEIGHT,
        }),
        'info',
      );
    }
  };

  const handleCoverFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const { width, height, ...photo } = await readPhotoFile(file, uploader);
      if (!cover && isFull) {
        showToast(
          t('poiEditor.poiMediaSection.reachedPhotoLimitRemove', { POI_MAX_PHOTOS }),
          'error',
        );
        return;
      }
      onChange('cover', photo);
      // Ảnh thu nhỏ ở bảng danh sách sẽ lấy theo ảnh bìa mới
      onChange('thumbnailUrl', undefined);
      warnLowResolution([{ caption: photo.caption, width, height }]);
      showToast(
        cover
          ? t('poiEditor.poiMediaSection.coverPhotoReplaced')
          : t('poiEditor.poiMediaSection.coverPhotoAdded'),
        'success',
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t('poiEditor.poiMediaSection.couldNotReadImage'),
        'error',
      );
    }
  };

  const handleGalleryFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const slots = POI_MAX_PHOTOS - photoCount;
    if (slots <= 0) {
      showToast(t('poiEditor.poiMediaSection.reachedLimitPhotosPer', { POI_MAX_PHOTOS }), 'error');
      return;
    }
    const accepted = files.slice(0, slots);
    const results = await Promise.allSettled(accepted.map((file) => readPhotoFile(file, uploader)));
    const photos = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
    const failedCount = results.length - photos.length;

    if (photos.length > 0) {
      onChange('gallery', [
        ...gallery,
        ...photos.map(({ id, url, caption, meta }) => ({
          id,
          url,
          meta,
          caption: captionFromFileName(caption),
        })),
      ]);
      warnLowResolution(photos);
      showToast(
        t('poiEditor.poiMediaSection.addedPhotosGallery', { count: photos.length }),
        'success',
      );
    }
    if (files.length > accepted.length) {
      showToast(
        t('poiEditor.poiMediaSection.onlyPhotosWereAdded', {
          length: accepted.length,
          length2: files.length,
          POI_MAX_PHOTOS,
        }),
        'info',
      );
    }
    if (failedCount > 0)
      showToast(
        t('poiEditor.poiMediaSection.filesNotValidImages', { count: failedCount }),
        'error',
      );
  };

  /** Đưa ảnh trong thư viện lên làm ảnh bìa, ảnh bìa cũ trở về đúng vị trí đó */
  const setAsCover = (photo: PoiPhoto) => {
    const nextGallery = gallery.flatMap((item) => {
      if (item.id !== photo.id) return [item];
      return cover ? [{ ...cover, caption: captionFromFileName(cover.caption) }] : [];
    });
    onChange('thumbnailUrl', undefined);
    onChange('cover', {
      ...photo,
      meta: photo.meta ?? t('poiEditor.poiMediaSection.selectedFromPhotoLibrary', { uploader }),
    });
    onChange('gallery', nextGallery);
    showToast(
      t('poiEditor.poiMediaSection.setAsCoverPhoto', { caption: photo.caption }),
      'success',
    );
  };

  const removePhoto = (photo: PoiPhoto) => {
    onChange(
      'gallery',
      gallery.filter((item) => item.id !== photo.id),
    );
    showToast(
      t('poiEditor.poiMediaSection.removedPhotoFromGallery', { caption: photo.caption }),
      'info',
    );
  };

  return (
    <PoiSectionCard
      icon="photo_library"
      title={t('poiEditor.poiMediaSection.n2PhotosMedia')}
      description={t('poiEditor.poiMediaSection.minimumResolution1920x1080pxWebp')}
      badge={
        <span className="rounded-full bg-surface-container-low px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-outline">
          {t('poiEditor.poiMediaSection.upPhotos', { POI_MAX_PHOTOS })}
        </span>
      }
    >
      <input
        ref={coverInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleCoverFile}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={handleGalleryFiles}
      />

      {/* Ảnh bìa 16:9 */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {t('poiEditor.poiMediaSection.coverPhoto169')}
          </span>
          {cover ? (
            <span className="font-label-sm text-label-sm font-semibold text-secondary">
              {t('poiEditor.poiMediaSection.activeMainPhoto')}
            </span>
          ) : (
            <span className="font-label-sm text-label-sm font-semibold text-error">
              {t('poiEditor.poiMediaSection.noCoverPhotoYet')}
            </span>
          )}
        </div>

        {cover ? (
          <div className="group relative h-64 w-full overflow-hidden rounded-xl bg-surface-container shadow-sm md:h-72">
            <img
              src={cover.url}
              alt={cover.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-on-surface/80 via-transparent to-transparent p-space-md">
              <div className="flex min-w-0 flex-col text-on-primary">
                <span className="truncate font-title-md text-title-md font-bold">
                  {cover.caption}
                </span>
                {cover.meta && (
                  <span className="font-label-sm text-label-sm opacity-80">{cover.meta}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-space-xs">
                <button
                  type="button"
                  title={t('poiEditor.poiMediaSection.viewFullSize')}
                  onClick={() => onPreview(cover)}
                  className="rounded-full bg-surface-container-lowest/80 p-2 text-on-surface backdrop-blur-md transition-colors hover:bg-surface-container-lowest"
                >
                  <Icon name="visibility" className="text-[18px]" />
                </button>
                <button
                  type="button"
                  title={t('poiEditor.poiMediaSection.replaceCoverPhoto')}
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full bg-surface-container-lowest/80 p-2 text-error backdrop-blur-md transition-colors hover:bg-surface-container-lowest"
                >
                  <Icon name="sync" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="group flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low text-outline transition-all hover:border-primary hover:text-primary md:h-72"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
              <Icon name="add_photo_alternate" className="text-[26px]" />
            </span>
            <span className="font-label-md text-label-md font-semibold">
              {t('poiEditor.poiMediaSection.uploadCoverPhoto')}
            </span>
            <span className="font-body-sm text-body-sm">
              {t('poiEditor.poiMediaSection.webpJpgPngRecommended')}
            </span>
          </button>
        )}
      </div>

      {/* Thư viện ảnh */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {t('poiEditor.poiMediaSection.photoGallery')}
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            {t('poiEditor.poiMediaSection.photos', { photoCount, POI_MAX_PHOTOS })}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-3 md:grid-cols-5">
          {gallery.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container shadow-xs"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                loading="lazy"
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-on-surface/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title={t('poiEditor.poiMediaSection.setAsCover')}
                  onClick={() => setAsCover(photo)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest text-label-sm text-on-surface"
                >
                  <Icon name="star" className="text-[14px]" />
                </button>
                <button
                  type="button"
                  title={t('poiEditor.poiMediaSection.viewPhoto')}
                  onClick={() => onPreview(photo)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest text-label-sm text-on-surface"
                >
                  <Icon name="visibility" className="text-[14px]" />
                </button>
                <button
                  type="button"
                  title={t('poiEditor.poiMediaSection.deletePhoto')}
                  onClick={() => removePhoto(photo)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest text-label-sm text-error"
                >
                  <Icon name="delete" className="text-[14px]" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1.5 rounded bg-on-surface/60 px-1.5 py-0.5 font-label-sm text-[10px] text-on-primary">
                {photo.caption}
              </span>
            </div>
          ))}

          <button
            type="button"
            disabled={isFull}
            onClick={() => galleryInputRef.current?.click()}
            className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-surface-container-low text-outline shadow-xs transition-all hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-container-low disabled:hover:text-outline"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container group-disabled:bg-surface-container group-disabled:text-outline">
              <Icon name="add_photo_alternate" className="text-[20px]" />
            </div>
            <span className="font-label-sm text-label-sm font-semibold">
              {isFull
                ? t('poiEditor.poiMediaSection.photosReached', { POI_MAX_PHOTOS })
                : t('poiEditor.poiMediaSection.addNewPhoto')}
            </span>
          </button>
        </div>
      </div>
    </PoiSectionCard>
  );
}
