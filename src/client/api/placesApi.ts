import { clientRequest } from './http';
import type { Paged, PlaceDetail, PlaceSummary } from './types';

export interface PlaceListParams {
  keyword?: string;
  category?: string;
  province?: string;
  page?: number;
  size?: number;
}

/** Danh sách & chi tiết địa điểm công khai (GET /api/places) — không cần đăng nhập */
export const placesApi = {
  list: ({ keyword, category, province, page = 0, size = 20 }: PlaceListParams) => {
    const search = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword?.trim()) search.set('keyword', keyword.trim());
    if (category) search.set('category', category);
    if (province) search.set('province', province);
    return clientRequest<Paged<PlaceSummary>>(`/places?${search.toString()}`, { auth: false });
  },

  get: (id: string | number) =>
    clientRequest<PlaceDetail>(`/places/${id}`, { auth: false }),
};
