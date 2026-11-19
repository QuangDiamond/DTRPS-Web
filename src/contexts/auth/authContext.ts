import { createContext } from 'react';
import type { AdminProfile } from '@/types';
import { activityClock } from '@/utils/useIdleTimeout';

/** Không thao tác bao nhiêu phút (tính chung mọi tab admin) thì phiên admin kết thúc */
export const ADMIN_IDLE_MINUTES = 30;
/** Hiện cảnh báo "sắp hết phiên" trước bao nhiêu giây */
export const ADMIN_IDLE_WARN_SECONDS = 60;
/** Mốc thao tác cuối của admin, dùng chung mọi tab */
export const adminActivity = activityClock('smarttravel.admin.lastActivity');

export interface AuthContextValue {
  admin: AdminProfile | null;
  login: (email: string, password: string) => Promise<AdminProfile>;
  logout: () => void;
  /** Không thao tác quá lâu: đăng xuất thật (thu hồi token) ở mọi tab admin */
  endIdle: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
