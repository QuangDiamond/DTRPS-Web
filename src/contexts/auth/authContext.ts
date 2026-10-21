import { createContext } from 'react';
import type { AdminProfile } from '@/types';

export interface AuthContextValue {
  admin: AdminProfile | null;
  login: (email: string, password: string, remember: boolean) => Promise<AdminProfile>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
