/** Tài khoản admin đang đăng nhập — API thật /users/me */
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

export interface AdminAccountInfo {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
}

export const adminAccountService = {
  me: () => apiRequest<AdminAccountInfo>(ENDPOINTS.me.profile),

  /** BE thay toàn bộ hồ sơ → gửi kèm các trường không sửa trên form để giữ nguyên */
  update: (current: AdminAccountInfo, changes: { name: string; phoneNumber: string | null }) =>
    apiRequest<AdminAccountInfo>(ENDPOINTS.me.profile, {
      method: 'PUT',
      body: {
        name: changes.name,
        phoneNumber: changes.phoneNumber,
        dateOfBirth: current.dateOfBirth,
        avatarUrl: current.avatarUrl,
      },
    }),
};
