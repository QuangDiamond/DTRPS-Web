/** Quản lý đánh giá (admin): đánh giá địa điểm (công khai) + đánh giá chuyến đi (riêng tư) */

export type PlaceReviewStatus = 'visible' | 'hidden';

export interface ReviewAuthor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AdminPlaceReview {
  id: string;
  author: ReviewAuthor;
  place: { id: string; name: string };
  rating: number;
  comment: string | null;
  imageUrls: string[];
  status: PlaceReviewStatus;
  /** Lý do ẩn gần nhất — chỉ có khi đang ẩn */
  hiddenReason: string | null;
  createdAt: string;
}

export interface AdminTripFeedback {
  id: string;
  author: ReviewAuthor;
  plan: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
  };
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewStats {
  placeTotal: number;
  placeVisible: number;
  placeHidden: number;
  /** null khi chưa có đánh giá */
  placeAverage: number | null;
  /** Đánh giá địa điểm 1-2 sao trong 7 ngày qua */
  lowRatingThisWeek: number;
  tripTotal: number;
  tripAverage: number | null;
  /** Số đánh giá đang có báo cáo chờ xử lý */
  reportedPending: number;
}

/** Báo cáo đánh giá: chờ xử lý / đã ẩn đánh giá / bỏ qua (không vi phạm) */
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export type ReportReason =
  'SPAM' | 'OFFENSIVE' | 'INAPPROPRIATE' | 'MISLEADING' | 'FAKE' | 'PRIVACY' | 'OTHER';

export interface ReviewReportEntry {
  id: string;
  reporter: ReviewAuthor;
  reason: ReportReason;
  note: string | null;
  createdAt: string;
}

/** Một đánh giá bị báo cáo, gộp các lượt báo cáo cùng trạng thái */
export interface ReportedReview {
  review: AdminPlaceReview;
  status: ReportStatus;
  reportCount: number;
  latestReportAt: string;
  /** Lý do → số lượt, nhiều nhất đứng đầu */
  reasons: { reason: ReportReason; count: number }[];
  reports: ReviewReportEntry[];
}

export interface ReportQuery {
  status: ReportStatus;
  reason?: ReportReason | 'all';
  placeId?: string;
  from?: string;
  to?: string;
  /** Nhiều lượt báo cáo nhất (mặc định) / báo cáo gần nhất */
  sort?: 'most' | 'newest';
  page: number;
  size: number;
}

/** Thứ tự: mới nhất (mặc định), cũ nhất, sao thấp trước, sao cao trước */
export type ReviewSort = 'newest' | 'oldest' | 'lowest' | 'highest';

export interface ReviewQuery {
  keyword?: string;
  /** Khoảng số sao 1-5, bỏ trống = không giới hạn */
  minRating?: number;
  maxRating?: number;
  status?: PlaceReviewStatus | 'all';
  /** Chỉ đánh giá địa điểm */
  placeId?: string;
  group?: string;
  category?: string;
  province?: string;
  /** Ngày gửi yyyy-MM-dd, gồm cả hai đầu */
  from?: string;
  to?: string;
  sort?: ReviewSort;
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}
