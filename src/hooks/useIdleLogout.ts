import i18n from 'i18next';
import { useIdleTimeout } from '@/utils/useIdleTimeout';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

/** Giống system_settings.session_timeout_minutes (mặc định 30) — đọc từ API khi backend có */
const SESSION_TIMEOUT_MINUTES = 30;

/**
 * Tab admin không thao tác quá thời gian cho phép → chỉ tab đó phải đăng nhập lại
 * (RequireAuth đưa về trang đăng nhập rồi quay lại đúng trang cũ). Các tab admin khác không bị ảnh hưởng.
 */
export function useIdleLogout(): void {
  const { admin, lockIdle } = useAuth();
  const { showToast } = useToast();
  useIdleTimeout(Boolean(admin), SESSION_TIMEOUT_MINUTES, () => {
    lockIdle();
    showToast(i18n.t('session.idleLogout', { minutes: SESSION_TIMEOUT_MINUTES }), 'info');
  });
}
