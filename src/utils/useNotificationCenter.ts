import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type LiveEvent, openLiveStream } from './liveStream';

/** Một thông báo đã lưu (khớp NotificationResponse bên BE) */
export interface AppNotification {
  id: number;
  type: string;
  /** Nhóm (tab chuông): REVIEW, LISTING, ADS, TRIP, OTHER */
  category: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPageResult {
  items: AppNotification[];
  total: number;
  page: number;
  size: number;
  unread: number;
  /** Nhóm người dùng đang có thông báo (theo thứ tự tab) → số chưa đọc */
  categories: Record<string, number>;
}

export interface NotificationQuery {
  category?: string;
  unread?: boolean;
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
}

/** Bộ lọc chuông: nhóm ('all' hoặc tên nhóm, ví dụ 'ADS') + chỉ hiện chưa đọc */
export interface NotificationFilter {
  category: string;
  unreadOnly: boolean;
}

/** Cách mỗi khu (admin / du khách–đối tác) gọi API — mỗi khu có http client và token riêng */
export interface NotificationApi {
  streamUrl: string;
  getToken: () => string | null;
  list: (query: NotificationQuery) => Promise<NotificationPageResult>;
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
  /** Tải lại trang đầu của tab đang xem */
  loadItems: () => void;
  filter: NotificationFilter;
  /** Đổi nhóm và/hoặc chỉ-chưa-đọc rồi tải lại từ đầu */
  setFilter: (change: Partial<NotificationFilter>) => void;
  /** Nhóm đang có thông báo → số chưa đọc */
  categories: Record<string, number>;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  toasts: LiveToast[];
  dismissToast: (key: number) => void;
  /** Nghe sự kiện realtime (để trang tự tải lại); trả về hàm huỷ */
  subscribe: (listener: LiveListener) => () => void;
}

const TOAST_MS = 6500;
const MAX_TOASTS = 3;
const PAGE_SIZE = 20;

const ALL_FILTER: NotificationFilter = { category: 'all', unreadOnly: false };

const filterQuery = (filter: NotificationFilter, page: number): NotificationQuery => ({
  page,
  size: PAGE_SIZE,
  unread: filter.unreadOnly || undefined,
  category: filter.category === 'all' ? undefined : filter.category,
});

/** Thông báo mới (luôn chưa đọc) có thuộc bộ lọc đang xem không */
const inFilter = (filter: NotificationFilter, category: string) =>
  filter.category === 'all' || filter.category === category;

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

  const [filter, setFilterState] = useState<NotificationFilter>(ALL_FILTER);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;
  /** Bỏ kết quả cũ khi người dùng đổi bộ lọc lúc request trước chưa xong */
  const requestId = useRef(0);

  const fetchPage = useCallback((nextFilter: NotificationFilter, nextPage: number) => {
    const current = apiRef.current;
    if (!current) return;
    const id = ++requestId.current;
    const setBusy = nextPage === 0 ? setLoading : setLoadingMore;
    setBusy(true);
    current
      .list(filterQuery(nextFilter, nextPage))
      .then((result) => {
        if (id !== requestId.current) return;
        setItems((existing) =>
          nextPage === 0
            ? result.items
            : [
                ...existing,
                ...result.items.filter((item) => !existing.some((old) => old.id === item.id)),
              ],
        );
        setPage(nextPage);
        setHasMore((nextPage + 1) * PAGE_SIZE < result.total);
        setUnread(result.unread);
        setCategories(result.categories ?? {});
      })
      .catch(() => undefined)
      .finally(() => {
        if (id === requestId.current) setBusy(false);
      });
  }, []);

  const loadItems = useCallback(() => fetchPage(filterRef.current, 0), [fetchPage]);

  const setFilter = useCallback(
    (change: Partial<NotificationFilter>) => {
      const next = { ...filterRef.current, ...change };
      setFilterState(next);
      filterRef.current = next;
      setItems([]);
      setHasMore(false);
      fetchPage(next, 0);
    },
    [fetchPage],
  );

  const pageRef = useRef(page);
  pageRef.current = page;
  const loadMore = useCallback(
    () => fetchPage(filterRef.current, pageRef.current + 1),
    [fetchPage],
  );

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
      setCategories({});
      setFilterState(ALL_FILTER);
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
        const category = event.category || 'OTHER';
        setCategories((current) => ({ ...current, [category]: (current[category] ?? 0) + 1 }));
        if (inFilter(filterRef.current, category)) {
          setItems((current) => [
            {
              id: event.notificationId!,
              type: event.type,
              category,
              title: event.title,
              message: event.message,
              link: event.link,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...current.filter((item) => item.id !== event.notificationId),
          ]);
        }
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
    if (item) {
      setCategories((current) =>
        item.category in current
          ? { ...current, [item.category]: Math.max(0, current[item.category] - 1) }
          : current,
      );
    }
    apiRef.current?.markRead(id).catch(() => undefined);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    setCategories((current) =>
      Object.fromEntries(Object.keys(current).map((category) => [category, 0])),
    );
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
      filter,
      setFilter,
      categories,
      hasMore,
      loadingMore,
      loadMore,
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
      filter,
      setFilter,
      categories,
      hasMore,
      loadingMore,
      loadMore,
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
