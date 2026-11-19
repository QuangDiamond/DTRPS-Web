import { useEffect, useRef, useState } from 'react';
import { timeAgo } from '@/utils/liveStream';
import type { AppNotification, NotificationFilter } from '@/utils/useNotificationCenter';
import Icon from './Icon';
import { NOTIFICATION_CATEGORIES, notificationTone } from './notificationMeta';

interface NotificationBellProps {
  unread: number;
  items: AppNotification[];
  loading: boolean;
  connected: boolean;
  filter: NotificationFilter;
  /** Nhóm đang có thông báo → số chưa đọc */
  categories: Record<string, number>;
  hasMore: boolean;
  loadingMore: boolean;
  onFilter: (change: Partial<NotificationFilter>) => void;
  onLoadMore: () => void;
  /** Đổi tên tab theo khu, ví dụ admin: LISTING = "Đối tác" */
  categoryLabels?: Partial<Record<string, string>>;
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
  filter,
  categories,
  hasMore,
  loadingMore,
  onFilter,
  onLoadMore,
  categoryLabels,
  onOpen,
  onSelect,
  onMarkAllRead,
  tone = 'light',
  buttonClassName = '',
}: NotificationBellProps) {
  const categoryNames = Object.keys(categories);
  // Chỉ một nhóm thì tab nhóm trùng "Tất cả" — không hiện thanh tab
  const tabs =
    categoryNames.length > 1
      ? [
          { value: 'all', label: 'Tất cả', icon: 'apps', count: 0 },
          ...categoryNames.map((category) => {
            const meta = NOTIFICATION_CATEGORIES[category] ?? NOTIFICATION_CATEGORIES.OTHER;
            return {
              value: category,
              label: categoryLabels?.[category] ?? meta.label,
              icon: meta.icon,
              count: categories[category],
            };
          }),
        ]
      : [];
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
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2.5">
            <div className="min-w-0">
              <p className="text-[16px] leading-tight font-bold text-slate-900">Thông báo</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`}
                />
                {connected ? 'Đang cập nhật trực tiếp' : 'Đang kết nối lại…'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex rounded-full bg-slate-100 p-0.5 text-[12px] font-semibold">
                {[
                  { unreadOnly: false, label: 'Tất cả' },
                  { unreadOnly: true, label: 'Chưa đọc' },
                ].map((option) => {
                  const active = filter.unreadOnly === option.unreadOnly;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        if (!active) onFilter({ unreadOnly: option.unreadOnly });
                      }}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-all ${
                        active
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {option.label}
                      {option.unreadOnly && unread > 0 && (
                        <span className="min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[10px] leading-[16px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={unread === 0}
                title="Đánh dấu tất cả đã đọc"
                aria-label="Đánh dấu tất cả đã đọc"
                className="flex h-8 w-8 items-center justify-center rounded-full text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-default disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                <Icon name="done_all" className="text-[19px]" />
              </button>
            </div>
          </div>

          {tabs.length > 0 && (
            <div
              role="tablist"
              aria-label="Nhóm thông báo"
              className="flex border-b border-slate-100 px-2"
            >
              {tabs.map((item) => {
                const active = item.value === filter.category;
                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    title={item.label}
                    onClick={() => {
                      if (!active) onFilter({ category: item.value });
                    }}
                    className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 pt-1.5 pb-2 transition-colors ${
                      active ? 'text-teal-700' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span className="relative">
                      <Icon name={item.icon} filled={active} className="text-[20px]" />
                      {item.count > 0 && (
                        <span className="absolute -top-1 -right-2.5 min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[9px] leading-[15px] font-bold text-white ring-2 ring-white">
                          {item.count > 99 ? '99+' : item.count}
                        </span>
                      )}
                    </span>
                    <span
                      className={`w-full truncate text-center text-[11px] ${active ? 'font-bold' : 'font-medium'}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`absolute inset-x-2 bottom-0 h-[3px] rounded-t-full transition-colors ${
                        active ? 'bg-teal-600' : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
          {tabs.length === 0 && <div className="border-b border-slate-100" />}

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
                <p className="text-[13px] font-semibold text-slate-700">
                  {filter.unreadOnly ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo'}
                </p>
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
            {hasMore && items.length > 0 && (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="flex w-full items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-teal-700 hover:bg-teal-50 disabled:text-slate-400"
              >
                {loadingMore ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
                ) : (
                  <Icon name="expand_more" className="text-[18px]" />
                )}
                {loadingMore ? 'Đang tải…' : 'Xem thêm'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
