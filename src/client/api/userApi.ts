import { clientRequest } from './http';
import type { ClientUser, ProfileInput, TravelPreferences } from './types';

export const userApi = {
  me: () => clientRequest<ClientUser>('/users/me'),

  /** Cập nhật họ tên, số điện thoại, ngày sinh, ảnh đại diện (email không đổi được) */
  updateProfile: (input: ProfileInput) =>
    clientRequest<ClientUser>('/users/me', { method: 'PUT', body: input }),

  preferences: () => clientRequest<TravelPreferences>('/users/me/preferences'),

  updatePreferences: (input: TravelPreferences) =>
    clientRequest<TravelPreferences>('/users/me/preferences', { method: 'PUT', body: input }),

  /** Đổi mật khẩu — BE thu hồi mọi phiên đăng nhập nên phải đăng nhập lại */
  changePassword: (currentPassword: string, newPassword: string) =>
    clientRequest<void>('/auth/password/change', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),
};
