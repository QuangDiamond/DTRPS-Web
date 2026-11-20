import i18n from 'i18next';
import {
  ADMIN_IDLE_MINUTES,
  ADMIN_IDLE_WARN_SECONDS,
  adminActivity,
} from '@/contexts/auth/authContext';
import { useIdleTimeout } from '@/utils/useIdleTimeout';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

/**
 * 30 phút không thao tác ở mọi tab admin → đăng xuất thật (RequireAuth đưa về trang đăng nhập rồi
 * quay lại đúng trang cũ). Còn 60 giây thì trả về số giây để AdminLayout hiện cảnh báo.
 */
export function useIdleLogout(): { secondsLeft: number | null; stayActive: () => void } {
  const { admin, endIdle } = useAuth();
  const { showToast } = useToast();
  return useIdleTimeout(
    Boolean(admin),
    adminActivity,
    ADMIN_IDLE_MINUTES,
    ADMIN_IDLE_WARN_SECONDS,
    () => {
      endIdle();
      showToast(i18n.t('session.idleLogout', { minutes: ADMIN_IDLE_MINUTES }), 'info');
    },
  );
}
