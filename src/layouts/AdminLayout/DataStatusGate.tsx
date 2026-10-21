import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, PageLoader } from '@/components/common';
import {
  useAdminProfile,
  useListings,
  useNotifications,
  usePartners,
  usePois,
  useSettings,
  useUsers,
} from '@/hooks';

/**
 * Chỉ hiển thị trang khi các store đã tải xong dữ liệu khởi tạo.
 * Chế độ mock: luôn sẵn sàng ngay. Chế độ API: hiện loader / lỗi kèm nút thử lại.
 */
export default function DataStatusGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const statuses = [
    useListings().dataStatus,
    usePartners().dataStatus,
    useUsers().dataStatus,
    usePois().dataStatus,
    useNotifications().dataStatus,
    useSettings().dataStatus,
    useAdminProfile().dataStatus,
  ];

  const failed = statuses.filter((item) => item.status === 'error');
  if (failed.length > 0) {
    return (
      <ErrorState
        title={t('common.systemLoadError')}
        message={failed[0].error}
        onRetry={() => failed.forEach((item) => item.reload())}
      />
    );
  }
  if (statuses.some((item) => item.status === 'loading')) return <PageLoader />;
  return <>{children}</>;
}
