import { clientRequest } from './http';
import type { Paged } from './types';

/** Đánh giá một địa điểm: 1-5 sao + nhận xét + tối đa 5 ảnh (GET /api/places/{id}/reviews) */
export interface PlaceReview {
  reviewId: number;
  placeId: number;
  userId: number;
  userName: string | null;
  userAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Trạng thái đánh giá của chính khách cho một địa điểm. {@code canReview}: được viết đánh giá mới
 * khi chưa đánh giá và đã từng chọn địa điểm này trong một chuyến đi — false thì chỉ xem được đánh
 * giá của người khác, không tự đánh giá được (kể cả khi đã đánh giá rồi, vì không sửa/xóa lại được).
 */
export interface PlaceReviewStatus {
  canReview: boolean;
  review: PlaceReview | null;
}

export interface PlaceReviewInput {
  rating: number;
  comment?: string | null;
  /** Ảnh chọn từ thư viện, chưa upload */
  photos?: File[];
}

/** Lý do báo cáo đánh giá của người khác (OTHER cần ghi chú) */
export type ReviewReportReason =
  'SPAM' | 'OFFENSIVE' | 'INAPPROPRIATE' | 'MISLEADING' | 'FAKE' | 'PRIVACY' | 'OTHER';

export const REPORT_REASONS: { value: ReviewReportReason; label: string; hint: string }[] = [
  { value: 'SPAM', label: 'Spam / quảng cáo', hint: 'Rao vặt, chèn link, lặp đi lặp lại' },
  { value: 'OFFENSIVE', label: 'Ngôn từ xúc phạm, thù ghét', hint: 'Chửi bới, công kích cá nhân' },
  {
    value: 'INAPPROPRIATE',
    label: 'Nội dung hoặc ảnh phản cảm',
    hint: 'Bạo lực, khiêu dâm, gây sốc',
  },
  {
    value: 'MISLEADING',
    label: 'Sai sự thật / không liên quan',
    hint: 'Nói về nơi khác, thông tin bịa đặt',
  },
  { value: 'FAKE', label: 'Đánh giá giả', hint: 'Chưa từng đến, đối thủ chơi xấu, mua đánh giá' },
  {
    value: 'PRIVACY',
    label: 'Lộ thông tin cá nhân',
    hint: 'Số điện thoại, địa chỉ, ảnh người khác',
  },
  { value: 'OTHER', label: 'Khác', hint: 'Ghi rõ lý do bên dưới' },
];

function toFormData(input: PlaceReviewInput): FormData {
  const form = new FormData();
  form.set('rating', String(input.rating));
  if (input.comment?.trim()) form.set('comment', input.comment.trim());
  (input.photos ?? []).forEach((file) => form.append('photos', file));
  return form;
}

const basePath = (placeId: number | string) => `/places/${placeId}/reviews`;

export const placeReviewApi = {
  list: (placeId: number | string, page = 0, size = 10) =>
    clientRequest<Paged<PlaceReview>>(`${basePath(placeId)}?page=${page}&size=${size}`, {
      auth: false,
    }),

  /** Trạng thái đánh giá của chính khách cho địa điểm này — xem {@link PlaceReviewStatus} */
  mine: (placeId: number | string) => clientRequest<PlaceReviewStatus>(`${basePath(placeId)}/me`),

  /** Id các đánh giá ở địa điểm này mà mình đã báo cáo */
  reported: (placeId: number | string) => clientRequest<number[]>(`${basePath(placeId)}/reported`),

  /** Báo cáo đánh giá của người khác — mỗi người một lần cho mỗi đánh giá */
  report: (
    placeId: number | string,
    reviewId: number,
    input: { reason: ReviewReportReason; note?: string | null },
  ) =>
    clientRequest<void>(`${basePath(placeId)}/${reviewId}/reports`, {
      method: 'POST',
      body: input,
    }),

  /** Gửi một lần, không sửa/xóa lại được. */
  create: (placeId: number | string, input: PlaceReviewInput) =>
    clientRequest<PlaceReview>(basePath(placeId), {
      method: 'POST',
      body: toFormData(input),
    }),
};
