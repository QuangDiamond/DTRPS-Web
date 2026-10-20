import Button from './Button';
import Icon from './Icon';

interface ErrorStateProps {
  message: string | null;
  onRetry: () => void;
  title?: string;
  fullScreen?: boolean;
}

/** Trạng thái lỗi khi tải dữ liệu, kèm nút thử lại */
export default function ErrorState({
  message,
  onRetry,
  title = 'Không tải được dữ liệu',
  fullScreen = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        fullScreen ? 'min-h-screen bg-surface' : 'min-h-[50vh]'
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
        <Icon name="cloud_off" className="text-[30px]" />
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
      {message && (
        <p className="max-w-md font-body-md text-body-md text-on-surface-variant">{message}</p>
      )}
      <Button icon="refresh" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}
