import { useContext } from 'react';
import { UsersContext, type UsersContextValue } from '@/contexts/users/usersContext';

export function useUsers(): UsersContextValue {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers phải được dùng bên trong <UsersProvider>');
  }
  return context;
}
