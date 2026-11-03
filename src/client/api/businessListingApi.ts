import { ClientApiError, clientRequest } from './http';
import type { BusinessListing, BusinessListingInput, ListingRevision } from './types';

export const businessListingApi = {
  /** Địa điểm của doanh nghiệp đang đăng nhập; null khi chưa đăng ký */
  getOwn: async (): Promise<BusinessListing | null> => {
    try {
      return await clientRequest<BusinessListing>('/business-listing');
    } catch (error) {
      if (error instanceof ClientApiError && error.status === 404) return null;
      throw error;
    }
  },

  submit: (input: BusinessListingInput) =>
    clientRequest<BusinessListing>('/business-listing', { method: 'POST', body: input }),

  /** Sửa khi đang chờ duyệt hoặc bị từ chối (bị từ chối → quay về chờ duyệt) */
  update: (input: BusinessListingInput) =>
    clientRequest<BusinessListing>('/business-listing', { method: 'PUT', body: input }),

  /** Đề xuất chỉnh sửa địa điểm đã duyệt — chỉ áp dụng sau khi Admin duyệt */
  proposeRevision: (input: BusinessListingInput) =>
    clientRequest<ListingRevision>('/business-listing/revisions', { method: 'POST', body: input }),

  /** Lịch sử đề xuất, mới nhất trước */
  revisions: () => clientRequest<ListingRevision[]>('/business-listing/revisions'),

  /** Rút lại đề xuất đang chờ duyệt */
  cancelRevision: (id: number) =>
    clientRequest<ListingRevision>(`/business-listing/revisions/${id}/cancel`, { method: 'POST' }),
};
