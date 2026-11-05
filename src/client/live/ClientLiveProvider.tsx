import { type ReactNode, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveToastStack from '@/components/common/LiveToastStack';
import { currentAccessToken } from '@/client/api/http';
import { notificationApi } from '@/client/api/notificationApi';
import { PartnerProfileContext } from '@/client/partner/partnerProfileContext';
import { API_URL } from '@/services/config';
import { useLiveEvents, useNotificationCenter } from '@/utils/useNotificationCenter';
import { ClientLiveContext } from './clientLiveContext';

/**
 * Thông báo + cập nhật realtime cho du khách / đối tác: admin duyệt hồ sơ, địa điểm, đề xuất sửa
 * thì trang tự cập nhật và hiện toast — không cần tải lại trang.
 */
export default function ClientLiveProvider({
  userId,
  children,
}: {
  userId: number;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const partnerProfile = useContext(PartnerProfileContext);
  const api = useMemo(
    () => ({
      streamUrl: `${API_URL}/notifications/stream`,
      getToken: currentAccessToken,
      ...notificationApi,
    }),
    // Đổi tài khoản → kết nối lại
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  );
  const center = useNotificationCenter(api);

  // Hồ sơ đối tác được duyệt / từ chối / khoá → tải lại hồ sơ (kèm lấy quyền đối tác mới)
  useLiveEvents(center.subscribe, ['PARTNER_'], () => partnerProfile?.reload());

  return (
    <ClientLiveContext.Provider value={center}>
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
    </ClientLiveContext.Provider>
  );
}
