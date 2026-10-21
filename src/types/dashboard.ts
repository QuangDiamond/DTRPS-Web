/** Bảng điều khiển */
import type { ListingCategory } from './listing';

export type DashboardRange = 'today' | '7days' | '30days' | 'thisyear' | 'custom';

/** Khoảng ngày dạng ISO YYYY-MM-DD */
export interface DateRange {
  from: string;
  to: string;
}

export interface DashboardStats {
  totalUsers: number;
  userGrowthPercent: number;
  newUsers30Days: number;
  totalPartners: number;
  partnerGrowthPercent: number;
  newPartnersThisMonth: number;
  totalListings: number;
  provincesCovered: number;
  pendingReviews: number;
  avgWaitHours: number;
  approvedListings: number;
  rejectedListings: number;
}

export interface GrowthPoint {
  /** Tháng 1 - 12 (nhãn hiển thị do giao diện dịch theo ngôn ngữ) */
  month: number;
  /** Tháng hiện tại — trục X ghi "Hiện tại" */
  current?: boolean;
  users: number;
  /** Lượt truy vấn tìm kiếm ngữ nghĩa AI (pgvector) */
  aiSearches: number;
}

export interface CategoryShare {
  category: ListingCategory;
  count: number;
}

export type ActivityKind =
  'partner_registered' | 'listing_approved' | 'listing_rejected' | 'listing_submitted';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  /** Tên đối tác / địa điểm được nhắc tới */
  subject: string;
  reason?: string;
  /** ISO datetime */
  createdAt: string;
}
