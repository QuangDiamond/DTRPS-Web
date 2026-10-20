import { createContext } from 'react';
import type {
  ActivityItem,
  Listing,
  ListingCategory,
  ListingFormValues,
  ListingStats,
  ListingVisibility,
  RejectionReasonCode,
} from '../types/admin';

export interface RejectOptions {
  /** Góp ý & hướng dẫn sửa đổi gửi cho đối tác */
  feedback?: string;
  /** Ghi chú kiểm duyệt nội bộ */
  note?: string;
  /** Nhóm lý do (phục vụ lọc ở màn Địa điểm bị từ chối) */
  reasonCode?: RejectionReasonCode;
}

export interface ListingsContextValue {
  listings: Listing[];
  activities: ActivityItem[];
  /** Số liệu toàn hệ thống, cập nhật theo các thao tác trong phiên */
  stats: ListingStats;
  /** Duyệt một hoặc nhiều hồ sơ đang chờ, trả về số hồ sơ đã duyệt */
  approveListings: (ids: string[], note?: string) => number;
  rejectListing: (id: string, reason: string, options?: RejectOptions) => void;
  /** Mở lại hồ sơ bị từ chối mà đối tác đã gửi lại, trả về true nếu thành công */
  reopenListing: (id: string) => boolean;
  /** Đóng vĩnh viễn hồ sơ bị từ chối, trả về số hồ sơ đã khóa */
  lockListings: (ids: string[]) => number;
  /** Ẩn / hiện niêm yết đã duyệt, trả về số niêm yết thay đổi */
  setListingsVisibility: (ids: string[], visibility: ListingVisibility, reason?: string) => number;
  updateListing: (id: string, values: ListingFormValues) => void;
  assignCategory: (ids: string[], category: ListingCategory) => void;
  /** Admin thêm thủ công một địa điểm (được duyệt ngay) */
  addListing: (values: ListingFormValues) => Listing;
}

export const ListingsContext = createContext<ListingsContextValue | null>(null);
