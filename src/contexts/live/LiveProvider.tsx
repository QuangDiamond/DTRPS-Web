import { type ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveToastStack from '@/components/common/LiveToastStack';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/services/config';
import { notificationService } from '@/services/liveNotificationService';
import { getAccessToken } from '@/services/tokenStore';
import { type NotificationApi, useNotificationCenter } from '@/utils/useNotificationCenter';
import { LiveContext } from './liveContext';

/**
 * Thông báo + cập nhật realtime cho khu admin: đối tác gửi hồ sơ / địa điểm / đề xuất sửa thì
 * hàng chờ và màn duyệt tự làm mới, kèm toast. Đặt trong AdminLayout (cần router để mở link).
 */
export default function LiveProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const api = useMemo<NotificationApi | null>(
    () =>
      admin
        ? {
            streamUrl: `${API_URL}/notifications/stream`,
            getToken: getAccessToken,
            list: notificationService.list,
            unreadCount: notificationService.unreadCount,
            markRead: notificationService.markRead,
            markAllRead: notificationService.markAllRead,
          }
        : null,
    [admin],
  );
  const center = useNotificationCenter(api);

  return (
    <LiveContext.Provider value={center}>
      {children}
      <LiveToastStack
        toasts={center.toasts}
        onClose={center.dismissToast}
        onOpen={(toast) => {
          center.dismissToast(toast.key);
          if (toast.event.notificationId) center.markRead(toast.event.notificationId);
          if (toast.event.link) navigate(toast.event.link);
        }}
      />
    </LiveContext.Provider>
  );
}
