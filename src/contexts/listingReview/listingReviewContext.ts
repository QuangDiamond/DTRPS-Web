import { createContext } from 'react';
import type {
  ListingReviewStats,
  ListingRevision,
  ReviewListing,
  RevisionDetail,
  RevisionRejectCode,
} from '@/types';

export interface ListingReviewContextValue {
  /** Số liệu niêm yết + số bản sửa chờ duyệt (badge Sidebar, thẻ thống kê) */
  stats: ListingReviewStats;
  /** Tăng sau mỗi thao tác — các trang danh sách / chi tiết dựa vào đây để tải lại */
  version: number;
  refreshStats: () => void;
  approveListing: (id: string) => Promise<ReviewListing>;
  rejectListing: (id: string, reason: string) => Promise<ReviewListing>;
  approveRevision: (id: string, note?: string) => Promise<RevisionDetail>;
  rejectRevision: (
    id: string,
    reasonCode: RevisionRejectCode,
    partnerFeedback: string,
    note?: string,
  ) => Promise<ListingRevision>;
}

export const ListingReviewContext = createContext<ListingReviewContextValue | null>(null);
