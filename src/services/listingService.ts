import { buildMockListingDetail } from '@/mocks/builders/listingDetailMock';
import {
  APPROVED_LISTING_STATS,
  DASHBOARD_STATS,
  MOCK_ACTIVITIES,
  MOCK_LISTINGS,
  REJECTED_LISTING_STATS,
} from '@/mocks/data/mockData';
import type {
  Listing,
  ListingCategory,
  ListingDetail,
  ListingFormValues,
  ListingsSnapshot,
  ListingVisibility,
  RejectOptions,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, peek, readRequest, writeRequest } from './request';

const MOCK_SNAPSHOT: ListingsSnapshot = {
  listings: MOCK_LISTINGS,
  activities: MOCK_ACTIVITIES,
  stats: {
    total: DASHBOARD_STATS.totalListings,
    pending: DASHBOARD_STATS.pendingReviews,
    approved: DASHBOARD_STATS.approvedListings,
    rejected: DASHBOARD_STATS.rejectedListings,
    hidden: APPROVED_LISTING_STATS.hidden,
    resubmitted: REJECTED_LISTING_STATS.resubmitted,
    locked: REJECTED_LISTING_STATS.locked,
    weeklyEngagements: APPROVED_LISTING_STATS.weeklyEngagements,
    weeklyEngagementGrowth: APPROVED_LISTING_STATS.weeklyEngagementGrowth,
  },
};

/** Dữ liệu khởi tạo của store niêm yết */
export const listingsSource = createSource(ENDPOINTS.listings.snapshot, MOCK_SNAPSHOT);

export const listingService = {
  peekDetail: (listing: Listing, allListings: Listing[]): ListingDetail | undefined =>
    peek(() => buildMockListingDetail(listing, allListings)),
  getDetail: (listing: Listing, allListings: Listing[]): Promise<ListingDetail> =>
    readRequest(ENDPOINTS.listings.detail(listing.id), () =>
      buildMockListingDetail(listing, allListings),
    ),

  create: (listing: Listing) => writeRequest(ENDPOINTS.listings.create, 'POST', listing),
  update: (id: string, values: ListingFormValues) =>
    writeRequest(ENDPOINTS.listings.update(id), 'PUT', values),
  approve: (ids: string[], note?: string) =>
    writeRequest(ENDPOINTS.listings.approve, 'POST', { ids, note }),
  reject: (id: string, reason: string, options: RejectOptions) =>
    writeRequest(ENDPOINTS.listings.reject(id), 'POST', { reason, ...options }),
  reopen: (id: string) => writeRequest(ENDPOINTS.listings.reopen(id), 'POST'),
  lock: (ids: string[]) => writeRequest(ENDPOINTS.listings.lock, 'POST', { ids }),
  setVisibility: (ids: string[], visibility: ListingVisibility, reason?: string) =>
    writeRequest(ENDPOINTS.listings.visibility, 'POST', { ids, visibility, reason }),
  assignCategory: (ids: string[], category: ListingCategory) =>
    writeRequest(ENDPOINTS.listings.category, 'POST', { ids, category }),
};
