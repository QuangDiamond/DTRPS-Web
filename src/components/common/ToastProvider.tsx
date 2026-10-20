import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastType } from '../../contexts/toast';
import Icon from './Icon';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const TOAST_DURATION_MS = 3000;

const TOAST_STYLES: Record<ToastType, { icon: string; className: string }> = {
  success: {
    icon: 'check_circle',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  error: { icon: 'error', className: 'bg-error-container text-on-error-container' },
  info: { icon: 'info', className: 'bg-surface-container-highest text-on-surface' },
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 bottom-6 z-[70] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex min-w-72 items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${TOAST_STYLES[toast.type].className}`}
          >
            <Icon name={TOAST_STYLES[toast.type].icon} className="text-[20px]" />
            <span className="flex-1 font-label-md text-label-md">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
              title="Đóng"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
