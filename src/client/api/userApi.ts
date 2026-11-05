import { clientRequest } from './http';
import type { ClientUser, Paged, PlaceSummary, ProfileInput, TravelPreferences } from './types';

export interface FavoritesQuery {
  page?: number;
  size?: number;
  keyword?: string;
  /** Mã nhóm dịch vụ (lodging, fnb, attraction, shopping) */
  group?: string;
  sort?: 'recent' | 'name';
}

export const userApi = {
  me: () => clientRequest<ClientUser>('/users/me'),

  /** Cập nhật họ tên, số điện thoại, ngày sinh, ảnh đại diện (email không đổi được) */
  updateProfile: (input: ProfileInput) =>
    clientRequest<ClientUser>('/users/me', { method: 'PUT', body: input }),

  /** Đổi ảnh đại diện (mọi vai trò) — BE lưu luôn và trả hồ sơ mới */
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return clientRequest<ClientUser>('/users/me/avatar', {
      method: 'POST',
      body: form,
      timeoutMs: 60_000,
    });
  },

  removeAvatar: () => clientRequest<ClientUser>('/users/me/avatar', { method: 'DELETE' }),

  preferences: () => clientRequest<TravelPreferences>('/users/me/preferences'),

  updatePreferences: (input: TravelPreferences) =>
    clientRequest<TravelPreferences>('/users/me/preferences', { method: 'PUT', body: input }),

  /** Đổi mật khẩu — BE thu hồi mọi phiên đăng nhập nên phải đăng nhập lại */
  changePassword: (currentPassword: string, newPassword: string) =>
    clientRequest<void>('/auth/password/change', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  /** Địa điểm đã lưu, phân trang bằng PageResponse chung của dự án */
  favorites: ({ page = 0, size = 20, keyword, group, sort }: FavoritesQuery = {}) => {
    const search = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword?.trim()) search.set('keyword', keyword.trim());
    if (group && group !== 'all') search.set('group', group);
    if (sort) search.set('sort', sort);
    return clientRequest<Paged<PlaceSummary>>(`/users/me/favorites?${search.toString()}`);
  },

  /** Lưu lại lần nữa không lỗi */
  addFavorite: (placeId: string | number) =>
    clientRequest<void>(`/users/me/favorites/${placeId}`, { method: 'PUT' }),

  /** Bỏ lại lần nữa cũng không lỗi */
  removeFavorite: (placeId: string | number) =>
    clientRequest<void>(`/users/me/favorites/${placeId}`, { method: 'DELETE' }),
};
