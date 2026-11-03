import { clientRequest } from './http';
import type { BusinessListing, BusinessListingInput, ListingRevision } from './types';

const BASE = '/business-listings';

/** Các địa điểm của doanh nghiệp đang đăng nhập — một doanh nghiệp có thể đăng ký nhiều địa điểm */
export const businessListingApi = {
  /** Tất cả địa điểm của mình, mới nhất trước */
  list: () => clientRequest<BusinessListing[]>(BASE),

  /** Một địa điểm của mình (404 nếu không phải của mình) */
  get: (id: number) => clientRequest<BusinessListing>(`${BASE}/${id}`),

  /** Đăng ký địa điểm mới → chờ Admin duyệt */
  submit: (input: BusinessListingInput) =>
    clientRequest<BusinessListing>(BASE, { method: 'POST', body: input }),

  /** Sửa khi đang chờ duyệt hoặc bị từ chối (bị từ chối → quay về chờ duyệt) */
  update: (id: number, input: BusinessListingInput) =>
    clientRequest<BusinessListing>(`${BASE}/${id}`, { method: 'PUT', body: input }),

  /** Đề xuất chỉnh sửa địa điểm đã duyệt — chỉ áp dụng sau khi Admin duyệt */
  proposeRevision: (id: number, input: BusinessListingInput) =>
    clientRequest<ListingRevision>(`${BASE}/${id}/revisions`, { method: 'POST', body: input }),

  /** Lịch sử đề xuất của một địa điểm, mới nhất trước */
  revisions: (id: number) => clientRequest<ListingRevision[]>(`${BASE}/${id}/revisions`),

  /** Rút lại đề xuất đang chờ duyệt */
  cancelRevision: (revisionId: number) =>
    clientRequest<ListingRevision>(`${BASE}/revisions/${revisionId}/cancel`, { method: 'POST' }),
};
