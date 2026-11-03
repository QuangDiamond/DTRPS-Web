import { formatDate, toIsoDate } from '@/utils/format';

/** ISO datetime → "12/03/2026" theo giờ máy */
export const toDisplayDate = (iso: string): string => formatDate(toIsoDate(new Date(iso)));
