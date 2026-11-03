import type {
  Listing,
  ListingSubType,
  ListingDetail,
  ListingFormValues,
  ListingsSnapshot,
  ListingVisibility,
  RejectOptions,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, readRequest, writeRequest } from './request';

/** Dữ liệu khởi tạo của store niêm yết */
export const listingsSource = createSource<ListingsSnapshot>(ENDPOINTS.listings.snapshot);

export const listingService = {
  getDetail: (listing: Listing): Promise<ListingDetail> =>
    readRequest(ENDPOINTS.listings.detail(listing.id)),

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
  assignCategory: (ids: string[], subType: ListingSubType) =>
    writeRequest(ENDPOINTS.listings.category, 'POST', { ids, subType }),
};
