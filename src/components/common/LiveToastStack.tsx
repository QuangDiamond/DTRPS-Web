import type { LiveToast } from '@/utils/useNotificationCenter';
import Icon from './Icon';
import { notificationTone } from './notificationMeta';

/** Toast realtime ở góc phải dưới: bấm để mở trang liên quan, tự ẩn sau vài giây */
export default function LiveToastStack({
  toasts,
  onOpen,
  onClose,
}: {
  toasts: LiveToast[];
  onOpen: (toast: LiveToast) => void;
  onClose: (key: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-20 z-[70] flex w-[min(92vw,360px)] flex-col gap-2.5 md:bottom-6"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const meta = notificationTone(toast.event.type);
        return (
          <div
            key={toast.key}
            role="status"
            className="live-toast pointer-events-auto relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.18)]"
          >
            <span className={`w-1.5 shrink-0 ${meta.accent}`} />
            <button
              type="button"
              onClick={() => onOpen(toast)}
              className="flex min-w-0 flex-1 gap-3 p-3.5 text-left"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}
              >
                <Icon name={meta.icon} filled className="text-[21px]" />
              </span>
              <span className="min-w-0 flex-1 pr-5">
                <span className="block text-[13px] font-bold text-slate-900">
                  {toast.event.title}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[12px] leading-[17px] text-slate-600">
                  {toast.event.message}
                </span>
                {toast.event.link && (
                  <span className="mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold text-teal-700">
                    Xem chi tiết <Icon name="arrow_forward" className="text-[13px]" />
                  </span>
                )}
              </span>
            </button>
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => onClose(toast.key)}
              className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
