import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorState, PageLoader } from '@/components/common';
import { usePartners } from '@/hooks';

/** Chỉ hiển thị trang khi số liệu dùng chung (đối tác) đã tải xong; lỗi thì có nút thử lại */
export default function DataStatusGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { dataStatus } = usePartners();

  if (dataStatus.status === 'error') {
    return (
      <ErrorState
        title={t('common.systemLoadError')}
        message={dataStatus.error}
        onRetry={dataStatus.reload}
      />
    );
  }
  if (dataStatus.status === 'loading') return <PageLoader />;
  return <>{children}</>;
}
