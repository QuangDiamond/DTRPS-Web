import { useContext } from 'react';
import { AdminProfileContext, type AdminProfileContextValue } from '../contexts/adminProfile';

export function useAdminProfile(): AdminProfileContextValue {
  const context = useContext(AdminProfileContext);
  if (!context) {
    throw new Error('useAdminProfile phải được dùng bên trong <AdminProfileProvider>');
  }
  return context;
}
