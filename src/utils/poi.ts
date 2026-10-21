import i18n from 'i18next';
import type { Poi } from '@/types';

/**
 * Nội dung POI theo ngôn ngữ đang chọn: tiếng Việt dùng bản gốc, ngôn ngữ khác dùng bản dịch server trả về.
 * Không có bản dịch → trả `fallback` (nhãn danh mục đã dịch) thay vì hiện tiếng Việt.
 */
export function localizePoiText(
  poi: Pick<Poi, 'subCategory' | 'highlight' | 'translations'>,
  field: 'subCategory' | 'highlight',
  fallback: string,
): string {
  const language = i18n.resolvedLanguage;
  if (language === 'vi' || !language) return poi[field] || fallback;
  const translated =
    poi.translations?.[language as keyof NonNullable<Poi['translations']>]?.[field];
  return translated || fallback;
}
/** "Phố cổ Hội An (Hoi An Ancient Town)" → "Phố cổ Hội An" */
export function shortPoiName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, '').trim() || name;
}

/** Giá vé (dữ liệu gốc tiếng Việt) là miễn phí */
export const isFreePrice = (price: string): boolean => /miễn phí/i.test(price);

/** Đơn vị giá trong dữ liệu gốc → key bản dịch */
const PRICE_UNITS: Record<string, 'ticket' | 'person' | 'visit' | 'night'> = {
  vé: 'ticket',
  người: 'person',
  lượt: 'visit',
  đêm: 'night',
};

/** Giá vé dạng ngắn ở bảng: "120,000 VNĐ / vé quốc tế, ..." → "120,000 đ/vé" / "120,000 VND/ticket" */
export function priceSummary(price: string): string {
  const text = price.trim();
  if (!text) return '—';
  if (isFreePrice(text)) return i18n.t('utils.poi.free');
  return text
    .split(/,\s+/)[0]
    .replace(/\s*\(.*\)\s*$/, '')
    .replace(/\s*VNĐ\s*\/\s*(vé|người|lượt|đêm)[^,]*$/i, (_, unit: string) =>
      i18n.t('utils.poi.perUnit', {
        unit: i18n.t(`utils.poi.units.${PRICE_UNITS[unit.toLowerCase()] ?? 'ticket'}`),
      }),
    )
    .replace(/\s*VNĐ/i, i18n.t('utils.poi.vnd'))
    .trim();
}

/** Vị trí ngắn ở bảng: "Phường Minh An, TP. Hội An, Tỉnh Quảng Nam" → "TP. Hội An, Quảng Nam" */
export function shortLocation(address: string): string {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts
    .slice(-2)
    .map((part) => part.replace(/^Tỉnh\s+/i, '').replace(/^Quận\s+/i, 'Q. '))
    .join(', ');
}
