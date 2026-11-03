import { clientRequest } from './http';

/** Khớp giới hạn của BE (ImageUploadService) */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadApi = {
  /** Tải một ảnh lên (BE lưu vào Cloudinary) và nhận lại đường dẫn https */
  image: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const result = await clientRequest<{ url: string }>('/uploads/images', {
      method: 'POST',
      body: form,
      timeoutMs: 60_000,
    });
    return result.url;
  },
};
