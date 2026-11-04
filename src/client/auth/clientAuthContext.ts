import { createContext, useContext } from 'react';
import type { ClientUser, RoleName } from '@/client/api/types';

export interface ClientAuthValue {
  user: ClientUser | null;
  login: (email: string, password: string, remember: boolean) => Promise<ClientUser>;
  register: (name: string, email: string, password: string) => Promise<ClientUser>;
  logout: () => void;
  /** Ghi thông tin user mới (sau khi sửa hồ sơ) vào phiên hiện tại */
  updateUser: (user: ClientUser) => void;
  /** Lấy token mới để nhận vai trò vừa được cấp (vd. BUSINESS_OWNER sau khi admin duyệt) */
  refreshSession: () => Promise<boolean>;
  hasRole: (role: RoleName) => boolean;
}

export const ClientAuthContext = createContext<ClientAuthValue | null>(null);

export function useClientAuth(): ClientAuthValue {
  const value = useContext(ClientAuthContext);
  if (!value) throw new Error('useClientAuth phải nằm trong ClientAuthProvider');
  return value;
}
