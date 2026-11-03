/**
 * Duyệt địa điểm mới & bản sửa của đối tác — luôn gọi API thật, không có dữ liệu mẫu.
 * Trạng thái backend viết hoa (PENDING…) được đổi sang chữ thường cho giao diện.
 */
import type {
  ListingReviewStats,
  ListingRevision,
  Paged,
  PlaceContent,
  ReviewListing,
  ReviewListingStatus,
  RevisionDetail,
  RevisionRejectCode,
  RevisionStatus,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

type ApiPlaceContent = PlaceContent;

interface ApiListing extends ApiPlaceContent {
  id: number;
  businessId: number;
  businessName: string;
  placeStatus: string;
  status: string;
  statusNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiRevision {
  id: number;
  listingId: number;
  businessName: string;
  status: string;
  proposed: ApiPlaceContent;
  rejectReasonCode: string | null;
  partnerFeedback: string | null;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const lower = <T extends string>(value: string) => value.toLowerCase() as T;
const upper = (value: string | undefined) =>
  value && value !== 'all' ? value.toUpperCase() : undefined;

/** Danh sách có thể vắng mặt ở dữ liệu cũ */
const content = (place: ApiPlaceContent): PlaceContent => ({
  ...place,
  openingHours: place.openingHours ?? [],
  prices: place.prices ?? [],
  images: place.images ?? [],
});

function toListing(listing: ApiListing): ReviewListing {
  return {
    ...content(listing),
    id: String(listing.id),
    businessId: String(listing.businessId),
    businessName: listing.businessName,
    placeStatus: listing.placeStatus,
    status: lower<ReviewListingStatus>(listing.status),
    statusNote: listing.statusNote ?? undefined,
    approvedAt: listing.approvedAt ?? undefined,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

function toRevision(revision: ApiRevision): ListingRevision {
  return {
    id: String(revision.id),
    listingId: String(revision.listingId),
    businessName: revision.businessName,
    status: lower<RevisionStatus>(revision.status),
    proposed: content(revision.proposed),
    rejectReasonCode: (revision.rejectReasonCode as RevisionRejectCode | null) ?? undefined,
    partnerFeedback: revision.partnerFeedback ?? undefined,
    reviewNote: revision.reviewNote ?? undefined,
    createdAt: revision.createdAt,
    reviewedAt: revision.reviewedAt ?? undefined,
  };
}

export interface ReviewQuery<S extends string> {
  status: S | 'all';
  keyword: string;
  /** Trang bắt đầu từ 0 */
  page: number;
  size: number;
}

const toQuery = <S extends string>(query: ReviewQuery<S>) => ({
  status: upper(query.status),
  keyword: query.keyword.trim() || undefined,
  page: query.page,
  size: query.size,
});

export const listingReviewService = {
  listListings: async (query: ReviewQuery<ReviewListingStatus>): Promise<Paged<ReviewListing>> => {
    const result = await apiRequest<ApiPage<ApiListing>>(ENDPOINTS.listingReview.list, {
      query: toQuery(query),
    });
    return { ...result, items: result.items.map(toListing) };
  },

  listRevisions: async (query: ReviewQuery<RevisionStatus>): Promise<Paged<ListingRevision>> => {
    const result = await apiRequest<ApiPage<ApiRevision>>(ENDPOINTS.listingReview.revisions, {
      query: toQuery(query),
    });
    return { ...result, items: result.items.map(toRevision) };
  },

  /** Số liệu niêm yết + số bản sửa đang chờ duyệt */
  stats: async (): Promise<ListingReviewStats> => {
    const [listings, revisions] = await Promise.all([
      apiRequest<Omit<ListingReviewStats, 'pendingRevisions'>>(ENDPOINTS.listingReview.stats),
      apiRequest<ApiPage<ApiRevision>>(ENDPOINTS.listingReview.revisions, {
        query: { status: 'PENDING', page: 0, size: 1 },
      }),
    ]);
    return { ...listings, pendingRevisions: revisions.total };
  },

  getListing: async (id: string): Promise<ReviewListing> =>
    toListing(await apiRequest<ApiListing>(ENDPOINTS.listingReview.detail(id))),

  approveListing: async (id: string): Promise<ReviewListing> =>
    toListing(
      await apiRequest<ApiListing>(ENDPOINTS.listingReview.approve(id), { method: 'POST' }),
    ),

  rejectListing: async (id: string, reason: string): Promise<ReviewListing> =>
    toListing(
      await apiRequest<ApiListing>(ENDPOINTS.listingReview.reject(id), {
        method: 'POST',
        body: { reason },
      }),
    ),

  getRevision: async (id: string): Promise<RevisionDetail> => {
    const result = await apiRequest<{ revision: ApiRevision; current: ApiListing }>(
      ENDPOINTS.listingReview.revision(id),
    );
    return { revision: toRevision(result.revision), current: toListing(result.current) };
  },

  approveRevision: async (id: string, note?: string): Promise<RevisionDetail> => {
    const result = await apiRequest<{ revision: ApiRevision; current: ApiListing }>(
      ENDPOINTS.listingReview.approveRevision(id),
      { method: 'POST', body: { note: note?.trim() || undefined } },
    );
    return { revision: toRevision(result.revision), current: toListing(result.current) };
  },

  rejectRevision: async (
    id: string,
    reasonCode: RevisionRejectCode,
    partnerFeedback: string,
    note?: string,
  ): Promise<ListingRevision> =>
    toRevision(
      await apiRequest<ApiRevision>(ENDPOINTS.listingReview.rejectRevision(id), {
        method: 'POST',
        body: { reasonCode, partnerFeedback, note: note?.trim() || undefined },
      }),
    ),
};
