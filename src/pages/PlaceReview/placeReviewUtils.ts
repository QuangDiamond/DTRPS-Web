import type {
  OpeningHour,
  PlaceContent,
  PlacePrice,
  ReviewListingStatus,
  RevisionRejectCode,
  RevisionStatus,
  TranslationKey,
} from '@/types';
import { formatDate, toIsoDate } from '@/utils/format';

export const LISTING_STATUS_STYLE: Record<
  ReviewListingStatus,
  { labelKey: TranslationKey; className: string }
> = {
  pending: {
    labelKey: 'placeReview.listingStatus.pending',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  approved: {
    labelKey: 'placeReview.listingStatus.approved',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  rejected: {
    labelKey: 'placeReview.listingStatus.rejected',
    className: 'bg-error-container text-on-error-container',
  },
  suspended: {
    labelKey: 'placeReview.listingStatus.suspended',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
};

export const REVISION_STATUS_STYLE: Record<
  RevisionStatus,
  { labelKey: TranslationKey; className: string }
> = {
  pending: {
    labelKey: 'placeReview.revisionStatus.pending',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  approved: {
    labelKey: 'placeReview.revisionStatus.approved',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  rejected: {
    labelKey: 'placeReview.revisionStatus.rejected',
    className: 'bg-error-container text-on-error-container',
  },
  cancelled: {
    labelKey: 'placeReview.revisionStatus.cancelled',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
};

export const REJECT_CODES: RevisionRejectCode[] = [
  'pricing',
  'location',
  'photos',
  'duplicate',
  'other',
];

export const REJECT_CODE_KEY: Record<RevisionRejectCode, TranslationKey> = {
  pricing: 'placeReview.reasons.pricing',
  location: 'placeReview.reasons.location',
  photos: 'placeReview.reasons.photos',
  duplicate: 'placeReview.reasons.duplicate',
  other: 'placeReview.reasons.other',
};

export const DAY_KEYS: Record<number, TranslationKey> = {
  1: 'placeReview.days.d1',
  2: 'placeReview.days.d2',
  3: 'placeReview.days.d3',
  4: 'placeReview.days.d4',
  5: 'placeReview.days.d5',
  6: 'placeReview.days.d6',
  7: 'placeReview.days.d7',
};

/** ISO datetime → "12/03/2026" */
export const displayDate = (iso?: string): string =>
  iso ? formatDate(toIsoDate(new Date(iso))) : '—';

export const formatAmount = (price: PlacePrice): string =>
  `${new Intl.NumberFormat('vi-VN').format(price.amount)} ${price.currency}`;

/** "ROOM_NIGHT" → "Room night" */
export const priceTypeLabel = (type: string): string => {
  const words = type.toLowerCase().split('_').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const hourText = (hour: OpeningHour, closedLabel: string): string =>
  hour.closed ? closedLabel : `${hour.openTime} – ${hour.closeTime}`;

export const googleMapsUrl = (place: Pick<PlaceContent, 'latitude' | 'longitude'>): string =>
  `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;

/** Bản đồ Google nhúng (không cần API key) — openstreetmap.org không truy cập được trên một số mạng ở VN */
export const mapEmbedUrl = (place: Pick<PlaceContent, 'latitude' | 'longitude'>): string =>
  `https://maps.google.com/maps?q=${place.latitude},${place.longitude}&z=16&hl=vi&output=embed`;

export const coverOf = (place: Pick<PlaceContent, 'images'>): string | undefined =>
  (place.images.find((image) => image.primary) ?? place.images[0])?.url;
