import { createContext, useContext } from 'react';
import type { ClientUser, RoleName } from '@/client/api/types';

export interface ClientAuthValue {
  user: ClientUser | null;
  login: (email: string, password: string, remember: boolean) => Promise<ClientUser>;
  /** Tiếp tục với Google (không dùng cho admin) */
  loginWithGoogle: (accessToken: string) => Promise<{ user: ClientUser; newAccount: boolean }>;
  /** Đổi mật khẩu, tab này vẫn đăng nhập (thiết bị khác bị đăng xuất) */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  /** Ghi thông tin user mới (sau khi sửa hồ sơ) vào phiên hiện tại */
  updateUser: (user: ClientUser) => void;
  /** Lấy token mới để nhận vai trò vừa được cấp (vd. BUSINESS_OWNER sau khi admin duyệt) */
  refreshSession: () => Promise<boolean>;
  hasRole: (role: RoleName) => boolean;
  /**
   * Khoá RIÊNG tab này vì không thao tác quá lâu: tab coi như chưa đăng nhập, nhưng phiên chung
   * vẫn giữ nên các tab khác không bị đăng xuất theo.
   */
  lockIdle: () => void;
}

export const ClientAuthContext = createContext<ClientAuthValue | null>(null);

export function useClientAuth(): ClientAuthValue {
  const value = useContext(ClientAuthContext);
  if (!value) throw new Error('useClientAuth phải nằm trong ClientAuthProvider');
  return value;
}
