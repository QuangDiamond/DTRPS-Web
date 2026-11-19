import { useEffect, useState } from 'react';
import { MAX_IMAGE_BYTES, MAX_IMAGES } from '@/pages/PlaceCatalog/placeEditorUtils';
import { systemAdminService } from '@/services/systemAdminService';

export interface PhotoLimits {
  maxImages: number;
  maxBytes: number;
  maxMb: number;
}

const DEFAULTS: PhotoLimits = {
  maxImages: MAX_IMAGES,
  maxBytes: MAX_IMAGE_BYTES,
  maxMb: MAX_IMAGE_BYTES / 1024 / 1024,
};

/** Dùng chung trong phiên: giới hạn ít khi đổi, BE vẫn kiểm tra lại mỗi lần lưu */
let cached: Promise<PhotoLimits> | null = null;

function fetchLimits(): Promise<PhotoLimits> {
  cached ??= systemAdminService
    .siteInfo()
    .then(({ limits }) => ({
      maxImages: limits.maxPlaceImages,
      maxBytes: limits.maxImageMb * 1024 * 1024,
      maxMb: limits.maxImageMb,
    }))
    .catch(() => {
      cached = null;
      return DEFAULTS;
    });
  return cached;
}

/** Số ảnh và dung lượng tối đa admin đặt ở Cài đặt hệ thống (mặc định 10 ảnh, 5MB) */
export function usePhotoLimits(): PhotoLimits {
  const [limits, setLimits] = useState(DEFAULTS);
  useEffect(() => {
    let active = true;
    void fetchLimits().then((next) => active && setLimits(next));
    return () => {
      active = false;
    };
  }, []);
  return limits;
}
