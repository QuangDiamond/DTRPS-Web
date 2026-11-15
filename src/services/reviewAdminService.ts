/**
 * Quản lý đánh giá (admin) — API thật /admin/reviews.
 * Trạng thái backend viết hoa (VISIBLE / HIDDEN) được đổi sang chữ thường cho giao diện.
 */
import type {
  AdminPlaceReview,
  AdminTripFeedback,
  Paged,
  PlaceReviewStatus,
  ReportedReview,
  ReportQuery,
  ReportReason,
  ReportStatus,
  ReviewAuthor,
  ReviewQuery,
  ReviewStats,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

interface ApiAuthor {
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ApiPlaceReview {
  reviewId: number;
  author: ApiAuthor;
  place: { placeId: number; name: string };
  rating: number;
  comment: string | null;
  imageUrls: string[] | null;
  status: string;
  hiddenReason: string | null;
  createdAt: string;
}

interface ApiTripFeedback {
  feedbackId: number;
  author: ApiAuthor;
  plan: { planId: number; title: string; destination: string; startDate: string; endDate: string };
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ApiReportedReview {
  review: ApiPlaceReview;
  reportStatus: string;
  reportCount: number;
  latestReportAt: string;
  reasons: Record<string, number>;
  reports: {
    reportId: number;
    reporter: ApiAuthor;
    reason: string;
    note: string | null;
    createdAt: string;
  }[];
}

interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const toAuthor = (author: ApiAuthor): ReviewAuthor => ({
  id: String(author.userId),
  name: author.name,
  email: author.email,
  avatarUrl: author.avatarUrl,
});

const toPlaceReview = (review: ApiPlaceReview): AdminPlaceReview => ({
  id: String(review.reviewId),
  author: toAuthor(review.author),
  place: { id: String(review.place.placeId), name: review.place.name },
  rating: review.rating,
  comment: review.comment,
  imageUrls: review.imageUrls ?? [],
  status: review.status.toLowerCase() as PlaceReviewStatus,
  hiddenReason: review.hiddenReason,
  createdAt: review.createdAt,
});

const toReported = (item: ApiReportedReview): ReportedReview => ({
  review: toPlaceReview(item.review),
  status: item.reportStatus.toLowerCase() as ReportStatus,
  reportCount: item.reportCount,
  latestReportAt: item.latestReportAt,
  // BE trả map đã sắp xếp nhiều lượt nhất trước — giữ thứ tự đó
  reasons: Object.entries(item.reasons).map(([reason, count]) => ({
    reason: reason as ReportReason,
    count,
  })),
  reports: item.reports.map((report) => ({
    id: String(report.reportId),
    reporter: toAuthor(report.reporter),
    reason: report.reason as ReportReason,
    note: report.note,
    createdAt: report.createdAt,
  })),
});

const toTripFeedback = (feedback: ApiTripFeedback): AdminTripFeedback => ({
  id: String(feedback.feedbackId),
  author: toAuthor(feedback.author),
  plan: {
    id: String(feedback.plan.planId),
    title: feedback.plan.title,
    destination: feedback.plan.destination,
    startDate: feedback.plan.startDate,
    endDate: feedback.plan.endDate,
  },
  rating: feedback.rating,
  comment: feedback.comment,
  createdAt: feedback.createdAt,
});

const optional = (value: string | undefined) => (value && value !== 'all' ? value : undefined);

function query(params: ReviewQuery) {
  return {
    page: params.page,
    size: params.size,
    keyword: params.keyword?.trim() || undefined,
    minRating: params.minRating,
    maxRating: params.maxRating,
    from: params.from || undefined,
    to: params.to || undefined,
    // Mặc định (mới nhất) thì không gửi
    sort: params.sort && params.sort !== 'newest' ? params.sort : undefined,
  };
}

/** Bộ lọc chỉ có ở đánh giá địa điểm */
function placeQuery(params: ReviewQuery) {
  return {
    ...query(params),
    status: optional(params.status)?.toUpperCase(),
    placeId: params.placeId || undefined,
    group: optional(params.group),
    category: optional(params.category),
    province: optional(params.province),
  };
}

export const reviewAdminService = {
  stats: () => apiRequest<ReviewStats>(ENDPOINTS.reviews.stats),

  placeReviews: async (params: ReviewQuery): Promise<Paged<AdminPlaceReview>> => {
    const page = await apiRequest<ApiPage<ApiPlaceReview>>(ENDPOINTS.reviews.places, {
      query: placeQuery(params),
    });
    return { ...page, items: page.items.map(toPlaceReview) };
  },

  /** Ẩn / hiện lại — lý do bắt buộc, được gửi tới người viết đánh giá */
  changeStatus: async (reviewId: string, status: PlaceReviewStatus, reason: string) =>
    toPlaceReview(
      await apiRequest<ApiPlaceReview>(ENDPOINTS.reviews.placeStatus(reviewId), {
        method: 'PUT',
        body: { status: status.toUpperCase(), reason },
      }),
    ),

  /** Đánh giá bị người dùng báo cáo, gộp theo đánh giá */
  reports: async (params: ReportQuery): Promise<Paged<ReportedReview>> => {
    const page = await apiRequest<ApiPage<ApiReportedReview>>(ENDPOINTS.reviews.reports, {
      query: {
        page: params.page,
        size: params.size,
        status: params.status.toUpperCase(),
        reason: params.reason && params.reason !== 'all' ? params.reason : undefined,
        placeId: params.placeId || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        sort: params.sort === 'newest' ? 'newest' : undefined,
      },
    });
    return { ...page, items: page.items.map(toReported) };
  },

  /**
   * Xử lý báo cáo: hide = ẩn đánh giá (lý do bắt buộc, gửi người viết), dismiss = bỏ qua (ghi chú
   * nội bộ). Người báo cáo nhận kết quả.
   */
  resolveReports: (reviewId: string, action: 'hide' | 'dismiss', reason: string) =>
    apiRequest<void>(ENDPOINTS.reviews.resolveReports(reviewId), {
      method: 'PUT',
      body: { action: action.toUpperCase(), reason: reason || null },
    }),

  tripFeedback: async (params: ReviewQuery): Promise<Paged<AdminTripFeedback>> => {
    const page = await apiRequest<ApiPage<ApiTripFeedback>>(ENDPOINTS.reviews.trips, {
      query: query(params),
    });
    return { ...page, items: page.items.map(toTripFeedback) };
  },
};
