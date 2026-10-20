import type { ApprovedListingFilters, Listing } from '../../types/admin';
import { formatDateWithPeriod } from '../../utils/format';
import { normalizeText } from '../../utils/string';

export function isHidden(listing: Listing): boolean {
  return listing.visibility === 'hidden';
}

export function filterApprovedListings(
  listings: Listing[],
  filters: ApprovedListingFilters,
): Listing[] {
  const keyword = normalizeText(filters.keyword);

  const filtered = listings.filter((listing) => {
    if (listing.status !== 'approved') return false;
    if (filters.category !== 'all' && listing.category !== filters.category) return false;
    if (filters.province !== 'all' && listing.province !== filters.province) return false;
    if (filters.tier !== 'all' && listing.partnerTier !== filters.tier) return false;
    if (filters.visibility !== 'all' && (listing.visibility ?? 'visible') !== filters.visibility) {
      return false;
    }
    if (filters.minRating > 0 && (listing.rating ?? 0) < filters.minRating) return false;
    if (!keyword) return true;
    return [listing.name, listing.id, listing.partnerName].some((field) =>
      normalizeText(field).includes(keyword),
    );
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'views':
        return (b.views ?? 0) - (a.views ?? 0);
      case 'recent':
        return (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? '');
    }
  });
}

/** Ngày duyệt hiển thị trong bảng */
export const formatApprovedAt = formatDateWithPeriod;
