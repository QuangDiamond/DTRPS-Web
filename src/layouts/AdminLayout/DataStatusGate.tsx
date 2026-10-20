import type { ReactNode } from 'react';
import ErrorState from '../../components/common/ErrorState';
import PageLoader from '../../components/common/PageLoader';
import { useAdminProfile } from '../../hooks/useAdminProfile';
import { useListings } from '../../hooks/useListings';
import { useNotifications } from '../../hooks/useNotifications';
import { usePartners } from '../../hooks/usePartners';
import { usePois } from '../../hooks/usePois';
import { useSettings } from '../../hooks/useSettings';
import { useUsers } from '../../hooks/useUsers';

/**
 * Chỉ hiển thị trang khi các store đã tải xong dữ liệu khởi tạo.
 * Chế độ mock: luôn sẵn sàng ngay. Chế độ API: hiện loader / lỗi kèm nút thử lại.
 */
export default function DataStatusGate({ children }: { children: ReactNode }) {
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
        title="Không tải được dữ liệu hệ thống"
        message={failed[0].error}
        onRetry={() => failed.forEach((item) => item.reload())}
      />
    );
  }
  if (statuses.some((item) => item.status === 'loading')) return <PageLoader />;
  return <>{children}</>;
}
