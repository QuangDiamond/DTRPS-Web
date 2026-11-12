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

export interface PlaceReviewInput {
  rating: number;
  comment?: string | null;
  /** Ảnh mới chọn từ thư viện, chưa upload */
  photos?: File[];
  /** Chỉ dùng khi sửa: URL ảnh cũ muốn giữ lại (ảnh không có trong danh sách này sẽ bị xóa) */
  keepImageUrls?: string[];
}

function toFormData(input: PlaceReviewInput): FormData {
  const form = new FormData();
  form.set('rating', String(input.rating));
  if (input.comment?.trim()) form.set('comment', input.comment.trim());
  (input.keepImageUrls ?? []).forEach((url) => form.append('keepImageUrls', url));
  (input.photos ?? []).forEach((file) => form.append('photos', file));
  return form;
}

const basePath = (placeId: number | string) => `/places/${placeId}/reviews`;

export const placeReviewApi = {
  list: (placeId: number | string, page = 0, size = 10) =>
    clientRequest<Paged<PlaceReview>>(
      `${basePath(placeId)}?page=${page}&size=${size}`,
      { auth: false },
    ),

  /** Đánh giá của chính khách cho địa điểm này — 404 nếu chưa đánh giá */
  mine: (placeId: number | string) => clientRequest<PlaceReview>(`${basePath(placeId)}/me`),

  create: (placeId: number | string, input: PlaceReviewInput) =>
    clientRequest<PlaceReview>(basePath(placeId), {
      method: 'POST',
      body: toFormData(input),
    }),

  update: (placeId: number | string, input: PlaceReviewInput) =>
    clientRequest<PlaceReview>(`${basePath(placeId)}/me`, {
      method: 'PUT',
      body: toFormData(input),
    }),

  remove: (placeId: number | string) =>
    clientRequest<void>(`${basePath(placeId)}/me`, { method: 'DELETE' }),
};
