import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/contexts/auth/authContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
}
