import i18n from 'i18next';
import { REJECTION_REASONS, RESUBMIT_WINDOW_DAYS } from '@/constants/listing';
import type { Listing, RejectedListingFilters, RejectionReason, ResubmissionStatus } from '@/types';
import { formatRelativeTime } from '@/utils/format';
import { normalizeText } from '@/utils/string';

const DAY_MS = 86_400_000;

/** Hạn chót đối tác được gửi lại hồ sơ */
export function getResubmitDeadline(listing: Listing): Date | null {
  if (!listing.reviewedAt) return null;
  return new Date(new Date(listing.reviewedAt).getTime() + RESUBMIT_WINDOW_DAYS * DAY_MS);
}

export function getResubmissionStatus(
  listing: Listing,
  now: Date = new Date(),
): ResubmissionStatus {
  if (listing.locked) return 'locked';
  if (listing.resubmittedAt) return 'resubmitted';
  const deadline = getResubmitDeadline(listing);
  return deadline && now > deadline ? 'overdue' : 'waiting';
}

/** Nội dung badge "Trạng thái gửi lại" */
export function getResubmissionLabel(listing: Listing, now: Date = new Date()): string {
  switch (getResubmissionStatus(listing, now)) {
    case 'resubmitted': {
      const hours = (now.getTime() - new Date(listing.resubmittedAt ?? now).getTime()) / 3_600_000;
      const when =
        hours < 24
          ? formatRelativeTime(listing.resubmittedAt ?? '', now)
          : hours < 48
            ? i18n.t('rejectedListings.utils.yesterday')
            : i18n.t('rejectedListings.utils.daysAgo', { count: Math.floor(hours / 24) });
      return i18n.t('rejectedListings.utils.resubmitted', { when });
    }
    case 'waiting': {
      const deadline = getResubmitDeadline(listing);
      const daysLeft = deadline
        ? Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS))
        : 0;
      return i18n.t('rejectedListings.utils.notResubmittedDaysLeft', { count: daysLeft });
    }
    case 'overdue':
      return i18n.t('rejectedListings.utils.overdueAutoArchived');
    case 'locked':
      return i18n.t('rejectedListings.utils.permanentlyClosed');
  }
}

const OTHER_REASON = REJECTION_REASONS[REJECTION_REASONS.length - 1];

export function getRejectionReason(listing: Listing): RejectionReason {
  return REJECTION_REASONS.find((reason) => reason.id === listing.rejectReasonCode) ?? OTHER_REASON;
}

/** Hồ sơ đã gửi lại được ưu tiên lên đầu, sau đó theo ngày từ chối mới nhất */
export function filterRejectedListings(
  listings: Listing[],
  filters: RejectedListingFilters,
): Listing[] {
  const keyword = normalizeText(filters.keyword);
  const now = new Date();

  return listings
    .filter((listing) => {
      if (listing.status !== 'rejected') return false;
      if (filters.reasonCode !== 'all' && getRejectionReason(listing).id !== filters.reasonCode) {
        return false;
      }
      if (
        filters.resubmission !== 'all' &&
        getResubmissionStatus(listing, now) !== filters.resubmission
      ) {
        return false;
      }
      if (filters.province !== 'all' && listing.province !== filters.province) return false;
      if (!keyword) return true;
      return [listing.name, listing.id, listing.partnerName, listing.partnerId ?? ''].some(
        (field) => normalizeText(field).includes(keyword),
      );
    })
    .sort((a, b) => {
      const aResubmitted = a.resubmittedAt && !a.locked ? 1 : 0;
      const bResubmitted = b.resubmittedAt && !b.locked ? 1 : 0;
      if (aResubmitted !== bResubmitted) return bResubmitted - aResubmitted;
      return (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? '');
    });
}
