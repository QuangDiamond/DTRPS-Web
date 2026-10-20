import type { Poi, PoiFormValues, PoiPhoto } from '../../types/admin';

export type PoiFieldChange = <K extends keyof PoiFormValues>(
  key: K,
  value: PoiFormValues[K],
) => void;

export type PoiFormErrors = Partial<Record<'name' | 'hotline' | 'website' | 'email', string>>;

export function toPoiFormValues(poi: Poi): PoiFormValues {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, updatedAt, updatedBy, source, sourceLabel, rating, reviewCount, ...values } = poi;
  return values;
}

export function isSamePoiValues(a: PoiFormValues, b: PoiFormValues): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+$/i;
const PHONE_PATTERN = /^[0-9+().\s-]{8,20}$/;

export function validatePoi(values: PoiFormValues): PoiFormErrors {
  const errors: PoiFormErrors = {};
  if (!values.name.trim()) errors.name = 'Vui lòng nhập tên điểm đến POI';
  if (values.hotline.trim() && !PHONE_PATTERN.test(values.hotline.trim())) {
    errors.hotline = 'Số điện thoại không hợp lệ';
  }
  if (values.website.trim() && !URL_PATTERN.test(values.website.trim())) {
    errors.website = 'Website phải bắt đầu bằng http:// hoặc https://';
  }
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Email không đúng định dạng';
  }
  return errors;
}

/** Lấy tên thành phố từ địa chỉ, ví dụ "…, TP. Hội An, …" → "Hội An" */
export function cityFromAddress(address: string): string {
  const city = /(?:TP\.|Thành phố)\s*([^,]+)/i.exec(address)?.[1];
  if (city) return city.trim();
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

export function formatCoordinate(value: number, axis: 'lat' | 'lng'): string {
  const direction = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

/** Nhận "15.8777° N", "-15.8777" hoặc "108,3262 E" — trả về null nếu không hợp lệ */
export function parseCoordinate(input: string, axis: 'lat' | 'lng'): number | null {
  const match = /-?\d+(?:[.,]\d+)?/.exec(input);
  if (!match) return null;
  let value = Number(match[0].replace(',', '.'));
  if (/[SW]\s*$/i.test(input.trim())) value = -Math.abs(value);
  const limit = axis === 'lat' ? 90 : 180;
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

export function openStreetMapEmbedUrl(latitude: number, longitude: number): string {
  const bbox = [longitude - 0.012, latitude - 0.008, longitude + 0.012, latitude + 0.008].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
}

export function priorityNote(score: number, city: string): string {
  const place = city ? ` khi đến ${city}` : '';
  if (score >= 90) return `★ Địa điểm bắt buộc ghé thăm (Must-visit)${place}.`;
  if (score >= 70) return `Địa điểm nên ghé thăm (Recommended)${place}.`;
  if (score >= 40) return 'Điểm tham quan bổ sung khi lịch trình còn trống (Optional).';
  return 'Ít được ưu tiên trong lộ trình gợi ý (Low priority).';
}

export function totalPhotos(values: Pick<PoiFormValues, 'cover' | 'gallery'>): number {
  return (values.cover ? 1 : 0) + values.gallery.length;
}

let photoSeq = 0;

/** Đọc file ảnh người dùng chọn → PoiPhoto (dùng object URL, chưa upload lên server) */
export function readPhotoFile(
  file: File,
  uploader: string,
): Promise<PoiPhoto & { width: number; height: number }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      photoSeq += 1;
      const sizeMb = (file.size / 1024 / 1024).toFixed(1);
      resolve({
        id: `upload-${Date.now()}-${photoSeq}`,
        url,
        caption: file.name,
        meta: `${image.naturalWidth} × ${image.naturalHeight} px • ${sizeMb} MB • Tải lên bởi ${uploader}`,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Không đọc được ảnh "${file.name}"`));
    };
    image.src = url;
  });
}

/** Tên file → nhãn ngắn hiển thị trên ô gallery */
export function captionFromFileName(fileName: string): string {
  const base = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return base.length > 18 ? `${base.slice(0, 16)}…` : base || 'Ảnh mới';
}
