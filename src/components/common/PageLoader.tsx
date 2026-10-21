import { useTranslation } from 'react-i18next';
import Icon from './Icon';

/** Trạng thái đang tải trang (dùng làm fallback cho route tải theo yêu cầu) */
export default function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-on-surface-variant ${
        fullScreen ? 'min-h-screen bg-surface' : 'min-h-[50vh]'
      }`}
    >
      <Icon name="progress_activity" className="animate-spin text-[36px] text-primary" />
      <span className="font-body-md text-body-md">{t('common.loading')}</span>
    </div>
  );
}
