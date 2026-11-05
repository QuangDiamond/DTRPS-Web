import { useEffect, useRef, useState } from 'react';
import { timeAgo } from '@/utils/liveStream';
import type { AppNotification } from '@/utils/useNotificationCenter';
import Icon from './Icon';
import { notificationTone } from './notificationMeta';

interface NotificationBellProps {
  unread: number;
  items: AppNotification[];
  loading: boolean;
  connected: boolean;
  onOpen: () => void;
  onSelect: (item: AppNotification) => void;
  onMarkAllRead: () => void;
  /** dark: nền header xanh đậm (khu du khách / đối tác) · light: header trắng (admin) */
  tone?: 'light' | 'dark';
  buttonClassName?: string;
}

/** Chuông thông báo + bảng thả xuống: danh sách mới nhất, đánh dấu đã đọc, trạng thái realtime */
export default function NotificationBell({
  unread,
  items,
  loading,
  connected,
  onOpen,
  onSelect,
  onMarkAllRead,
  tone = 'light',
  buttonClassName = '',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  const toggle = () => {
    if (!open) onOpen();
    setOpen((value) => !value);
  };

  const badge = unread > 99 ? '99+' : String(unread);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          tone === 'dark'
            ? 'bg-white/12 text-white hover:bg-white/20'
            : 'bg-[#F1F4F8] text-slate-600 hover:bg-[#E4EAF1] hover:text-slate-900'
        } ${open ? (tone === 'dark' ? 'bg-white/25' : 'bg-[#E4EAF1]') : ''} ${buttonClassName}`}
      >
        <Icon name="notifications" filled={unread > 0} className="text-[21px]" />
        {unread > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] leading-none font-bold text-white ring-2 ${
              tone === 'dark' ? 'ring-[#0B5E62]' : 'ring-white'
            }`}
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 z-50 w-[min(92vw,380px)] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-[15px] font-bold text-slate-900">Thông báo</p>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`}
                />
                {connected ? 'Đang cập nhật trực tiếp' : 'Đang kết nối lại…'}
              </p>
            </div>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unread === 0}
              className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-teal-700 hover:bg-teal-50 disabled:cursor-default disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              <Icon name="done_all" className="text-[16px]" />
              Đọc hết
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex flex-col gap-3 p-4">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex animate-pulse gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Icon name="notifications_off" className="text-[26px]" />
                </span>
                <p className="text-[13px] font-semibold text-slate-700">Chưa có thông báo</p>
                <p className="text-[12px] text-slate-500">
                  Kết quả duyệt và các thay đổi mới sẽ hiện ở đây.
                </p>
              </div>
            ) : (
              <ul>
                {items.map((item) => {
                  const meta = notificationTone(item.type);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onSelect(item);
                        }}
                        className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                          item.read ? '' : 'bg-teal-50/40'
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}
                        >
                          <Icon name={meta.icon} filled className="text-[19px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[13px] leading-snug ${item.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}
                            >
                              {item.title}
                            </span>
                            {!item.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-600" />
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-[12px] leading-[17px] text-slate-500">
                            {item.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {timeAgo(item.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
