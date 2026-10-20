import { useContext } from 'react';
import { NotificationsContext, type NotificationsContextValue } from '../contexts/notifications';

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications phải được dùng bên trong <NotificationsProvider>');
  }
  return context;
}
