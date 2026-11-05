import { createContext } from 'react';
import type { AdminProfile } from '@/types';

export interface AuthContextValue {
  admin: AdminProfile | null;
  login: (email: string, password: string, remember: boolean) => Promise<AdminProfile>;
  logout: () => void;
  /** Khoá RIÊNG tab này vì không thao tác quá lâu — các tab admin khác vẫn đăng nhập */
  lockIdle: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
