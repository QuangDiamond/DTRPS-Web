import i18n from 'i18next';
import type { Listing, ListingDetail, ReviewLogEntry } from '@/types';
import { pad2 } from '@/utils/format';

/** Nhật ký thẩm định: nộp hồ sơ + log hệ thống + kết quả xử lý (mới nhất lên đầu) */
export function buildReviewLogs(listing: Listing, detail: ListingDetail): ReviewLogEntry[] {
  const submittedTime = new Date(listing.submittedAt).getTime();
  const entries: ReviewLogEntry[] = [
    {
      id: 'submitted',
      time: listing.submittedAt,
      text: i18n.t('listingReview.utils.partnerSubmittedNewListing', {
        partnerName: listing.partnerName,
      }),
      tone: 'muted',
    },
    ...detail.logs.map((log, index) => ({
      id: `system-${index}`,
      time: new Date(submittedTime + log.minutesAfterSubmit * 60_000).toISOString(),
      text: log.text,
      tone: 'primary' as const,
    })),
  ];

  if (listing.reviewedAt && listing.status !== 'pending') {
    const note = listing.reviewNote
      ? i18n.t('listingReview.utils.note', { reviewNote: listing.reviewNote })
      : '';
    entries.push({
      id: 'reviewed',
      time: listing.reviewedAt,
      text: [
        listing.status === 'approved'
          ? i18n.t('listingReview.utils.anAdministratorApprovedPlace')
          : i18n.t('listingReview.utils.anAdministratorRejectedPlace', {
              value: listing.rejectReason ?? '—',
            }),
        note,
      ]
        .filter(Boolean)
        .join(' '),
      tone: listing.status === 'approved' ? 'primary' : 'error',
    });
  }

  return entries.sort((a, b) => b.time.localeCompare(a.time));
}

/** "14h 22m" */
export function formatWaitDuration(fromIso: string, toIso?: string): string {
  const end = toIso ? new Date(toIso).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.floor((end - new Date(fromIso).getTime()) / 60_000));
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

/** "24/10/2024 lúc 09:42" */
export function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  return i18n.t('listingReview.utils.at', {
    value: pad2(date.getDate()),
    value2: pad2(date.getMonth() + 1),
    getFullYear: date.getFullYear(),
    value3: pad2(date.getHours()),
    value4: pad2(date.getMinutes()),
  });
}

export function getMapsUrl(listing: Listing, detail: ListingDetail): string {
  const query = detail.location.coordinates
    ? `${detail.location.coordinates.lat},${detail.location.coordinates.lng}`
    : `${listing.name}, ${listing.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
