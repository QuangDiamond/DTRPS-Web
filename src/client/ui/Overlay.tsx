import { type ReactNode, useEffect } from 'react';

/** Lớp phủ + khung hộp thoại (mobile dùng Alert / Modal); Esc hoặc bấm nền để đóng */
export function Dialog({
  label,
  onClose,
  children,
  className = 'max-w-md',
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-white ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Hộp thoại xác nhận hai nút (Hủy / hành động) */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Hủy',
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog label={title} onClose={onClose} className="max-w-sm">
      <div className="p-5">
        <p className="text-[17px] font-extrabold text-client-ink">{title}</p>
        <div className="mt-2 text-[13px] leading-5 text-client-muted">{message}</div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-full bg-client-soft text-[13px] font-bold text-client-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`h-11 flex-1 rounded-full text-[13px] font-bold text-white ${
              danger ? 'bg-client-danger' : 'bg-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/** Thông báo ngắn ở cuối màn hình — dùng cùng useNotice */
export function NoticeToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-client-ink px-4 py-2 text-center text-[12px] text-white shadow-lg md:bottom-8"
    >
      {message}
    </div>
  );
}
