import { clientRequest } from './http';
import type { AuthResponse } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    clientRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: email.trim().toLowerCase(), password },
    }),

  register: (name: string, email: string, password: string) =>
    clientRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: { name: name.trim(), email: email.trim().toLowerCase(), password },
    }),

  /** Đổi refresh token lấy cặp token mới (kèm vai trò mới nhất của user) */
  refresh: (refreshToken: string) =>
    clientRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: { refreshToken },
    }),

  /** Kết thúc phiên trên thiết bị này */
  revoke: (refreshToken: string) =>
    clientRequest<void>('/auth/revoke', { method: 'POST', auth: false, body: { refreshToken } }),
};
