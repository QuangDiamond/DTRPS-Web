import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LiveEvent, openLiveStream } from './liveStream';

/** Một thông báo đã lưu (khớp NotificationResponse bên BE) */
export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPageResult {
  items: AppNotification[];
  total: number;
  unread: number;
}

/** Cách mỗi khu (admin / du khách–đối tác) gọi API — mỗi khu có http client và token riêng */
export interface NotificationApi {
  streamUrl: string;
  getToken: () => string | null;
  list: () => Promise<NotificationPageResult>;
  unreadCount: () => Promise<number>;
  markRead: (id: number) => Promise<unknown>;
  markAllRead: () => Promise<unknown>;
}

export interface LiveToast {
  key: number;
  event: LiveEvent;
}

export type LiveListener = (event: LiveEvent) => void;

export interface NotificationCenter {
  unread: number;
  items: AppNotification[];
  loading: boolean;
  connected: boolean;
  loadItems: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  toasts: LiveToast[];
  dismissToast: (key: number) => void;
  /** Nghe sự kiện realtime (để trang tự tải lại); trả về hàm huỷ */
  subscribe: (listener: LiveListener) => () => void;
}

const TOAST_MS = 6500;
const MAX_TOASTS = 3;

/**
 * Trung tâm thông báo: số chưa đọc, danh sách, toast và luồng realtime.
 * {@code api} null = chưa đăng nhập (không kết nối).
 */
export function useNotificationCenter(api: NotificationApi | null): NotificationCenter {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const listeners = useRef(new Set<LiveListener>());
  const apiRef = useRef(api);
  apiRef.current = api;
  const nextToast = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((key: number) => {
    setToasts((current) => current.filter((toast) => toast.key !== key));
    window.clearTimeout(timers.current.get(key));
    timers.current.delete(key);
  }, []);

  const loadItems = useCallback(() => {
    const current = apiRef.current;
    if (!current) return;
    setLoading(true);
    current
      .list()
      .then((page) => {
        setItems(page.items);
        setUnread(page.unread);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const refreshCount = useCallback(() => {
    apiRef.current
      ?.unreadCount()
      .then(setUnread)
      .catch(() => undefined);
  }, []);

  const active = Boolean(api);
  const streamUrl = api?.streamUrl;
  useEffect(() => {
    if (!active || !streamUrl) {
      setUnread(0);
      setItems([]);
      setConnected(false);
      return;
    }
    refreshCount();
    const close = openLiveStream({
      url: streamUrl,
      getToken: () => apiRef.current?.getToken() ?? null,
      // Gọi một request thường: http client tự làm mới token khi gặp 401
      refreshToken: async () => {
        await apiRef.current?.unreadCount();
      },
      onStatus: setConnected,
      onOpen: refreshCount,
      onEvent: (event) => {
        listeners.current.forEach((listener) => listener(event));
        if (event.notificationId === null) return;
        setUnread((count) => count + 1);
        setItems((current) => [
          {
            id: event.notificationId!,
            type: event.type,
            title: event.title,
            message: event.message,
            link: event.link,
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...current.filter((item) => item.id !== event.notificationId),
        ]);
        const key = nextToast.current++;
        setToasts((current) => [...current, { key, event }].slice(-MAX_TOASTS));
        timers.current.set(
          key,
          window.setTimeout(() => dismissToast(key), TOAST_MS),
        );
      },
    });
    return close;
  }, [active, streamUrl, refreshCount, dismissToast]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const markRead = useCallback((id: number) => {
    const item = itemsRef.current.find((candidate) => candidate.id === id);
    if (item?.read) return;
    setItems((current) =>
      current.map((candidate) => (candidate.id === id ? { ...candidate, read: true } : candidate)),
    );
    setUnread((count) => Math.max(0, count - 1));
    apiRef.current?.markRead(id).catch(() => undefined);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    apiRef.current?.markAllRead().catch(() => undefined);
  }, []);

  const subscribe = useCallback((listener: LiveListener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return useMemo(
    () => ({
      unread,
      items,
      loading,
      connected,
      loadItems,
      markRead,
      markAllRead,
      toasts,
      dismissToast,
      subscribe,
    }),
    [
      unread,
      items,
      loading,
      connected,
      loadItems,
      markRead,
      markAllRead,
      toasts,
      dismissToast,
      subscribe,
    ],
  );
}

/**
 * Gọi {@code onEvent} khi có sự kiện khớp {@code types} (tiền tố, ví dụ "LISTING_" hoặc
 * "REVISION_SUBMITTED"). Dùng để trang tự tải lại khi bên kia thay đổi dữ liệu.
 */
export function useLiveEvents(
  subscribe: NotificationCenter['subscribe'] | undefined,
  types: string[],
  onEvent: (event: LiveEvent) => void,
): void {
  const handler = useRef(onEvent);
  handler.current = onEvent;
  const key = types.join('|');
  useEffect(() => {
    if (!subscribe) return;
    const prefixes = key.split('|');
    return subscribe((event) => {
      if (prefixes.some((prefix) => event.type.startsWith(prefix))) handler.current(event);
    });
  }, [subscribe, key]);
}
