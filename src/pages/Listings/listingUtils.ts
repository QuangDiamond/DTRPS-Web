import i18n from 'i18next';
import { LISTING_OVERDUE_HOURS, LISTING_STATUS_CONFIG } from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import type { Listing, ListingFilters, ListingStatus } from '@/types';
import { formatDayTime, formatRelativeTime, toIsoDate } from '@/utils/format';
import type { SortAccessors } from '@/utils/sort';
import { normalizeText } from '@/utils/string';
import { getListingSubTypeLabel } from '@/constants/listingMap';

export type ListingTab = ListingStatus | 'all';

const LISTING_TABS: ListingTab[] = ['all', 'pending', 'approved', 'rejected'];

/** Đọc tab từ query ?status=... (link từ Bảng điều khiển) */
export function parseListingTab(value: string | null): ListingTab {
  return LISTING_TABS.find((tab) => tab === value) ?? 'all';
}

export function getWaitHours(listing: Listing, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(listing.submittedAt).getTime()) / 3_600_000);
}

export function isOverdue(listing: Listing, now: Date = new Date()): boolean {
  return listing.status === 'pending' && getWaitHours(listing, now) >= LISTING_OVERDUE_HOURS;
}

export function filterListings(
  listings: Listing[],
  tab: ListingTab,
  filters: ListingFilters,
  partnerId: string | null,
): Listing[] {
  const now = new Date();
  const keyword = normalizeText(filters.keyword);
  const today = toIsoDate(now);

  return listings
    .filter((listing) => {
      if (tab !== 'all' && listing.status !== tab) return false;
      if (partnerId && listing.partnerId !== partnerId) return false;
      if (filters.category !== 'all' && listing.category !== filters.category) return false;
      if (filters.province !== 'all' && listing.province !== filters.province) return false;
      if (filters.tier !== 'all' && listing.partnerTier !== filters.tier) return false;

      const hours = getWaitHours(listing, now);
      if (filters.priority === 'overdue' && !isOverdue(listing, now)) return false;
      if (filters.priority === 'medium' && (hours < 2 || hours > 12)) return false;
      if (filters.priority === 'today' && toIsoDate(new Date(listing.submittedAt)) !== today) {
        return false;
      }

      if (!keyword) return true;
      return [listing.name, listing.id, listing.partnerName].some((field) =>
        normalizeText(field).includes(keyword),
      );
    })
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/** Nội dung cột "Thời gian chờ" */
export function getWaitDisplay(listing: Listing): {
  primary: string;
  primaryClass: string;
  secondary: string;
} {
  const hours = getWaitHours(listing);
  const secondary = formatDayTime(listing.submittedAt);

  if (isOverdue(listing)) {
    return {
      primary: i18n.t('listings.utils.overdueH', { hours }),
      primaryClass: 'font-bold text-error',
      secondary,
    };
  }
  return {
    primary: formatRelativeTime(listing.submittedAt),
    primaryClass:
      listing.status === 'pending' && hours < 1
        ? 'font-semibold text-tertiary'
        : 'font-semibold text-on-surface',
    secondary,
  };
}

export function googleMapsUrl(listing: Listing): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${listing.name}, ${listing.address}`,
  )}`;
}

export type ListingSortKey = 'name' | 'partner' | 'category' | 'province' | 'wait' | 'status';

export const LISTING_SORT_ACCESSORS: SortAccessors<Listing, ListingSortKey> = {
  name: (listing) => listing.name,
  partner: (listing) => listing.partnerName,
  category: (listing) => getListingSubTypeLabel(listing),
  province: (listing) => PROVINCE_NAMES[listing.province],
  // Thời gian chờ tăng dần = hồ sơ gửi gần nhất trước
  wait: (listing) => -new Date(listing.submittedAt).getTime(),
  status: (listing) => LISTING_STATUS_CONFIG[listing.status].label,
};
