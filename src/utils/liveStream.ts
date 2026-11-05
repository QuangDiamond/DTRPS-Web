/** Sự kiện realtime từ GET /api/notifications/stream (khớp LiveEvent bên BE) */
export interface LiveEvent {
  /** Ví dụ LISTING_APPROVED, REVISION_SUBMITTED */
  type: string;
  /** Có giá trị khi sự kiện cũng được lưu thành thông báo; null = chỉ để làm mới màn hình */
  notificationId: number | null;
  title: string;
  message: string;
  link: string | null;
  data: {
    businessId?: number;
    listingId?: number;
    revisionId?: number;
    placeId?: number;
    status?: string;
    [key: string]: unknown;
  };
}

interface LiveStreamOptions {
  url: string;
  getToken: () => string | null;
  /** Gọi khi máy chủ trả 401: làm mới access token (qua request thường) rồi kết nối lại */
  refreshToken: () => Promise<void>;
  onEvent: (event: LiveEvent) => void;
  /** Kết nối (lại) thành công — nên tải lại dữ liệu vì có thể đã lỡ sự kiện lúc mất mạng */
  onOpen?: () => void;
  onStatus?: (connected: boolean) => void;
}

const MAX_BACKOFF_MS = 30_000;

/**
 * Mở luồng Server-Sent Events có gửi kèm Authorization (EventSource không gửi được header nên
 * đọc bằng fetch + ReadableStream). Tự kết nối lại với thời gian chờ tăng dần. Trả về hàm đóng.
 */
export function openLiveStream(options: LiveStreamOptions): () => void {
  let closed = false;
  let controller: AbortController | null = null;
  let retryTimer: number | undefined;
  let attempt = 0;

  const scheduleRetry = () => {
    if (closed) return;
    options.onStatus?.(false);
    const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt);
    attempt += 1;
    retryTimer = window.setTimeout(connect, delay);
  };

  const dispatch = (block: string) => {
    let name = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue; // heartbeat
      if (line.startsWith('event:')) name = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    if (name !== 'notification' || data.length === 0) return;
    try {
      options.onEvent(JSON.parse(data.join('\n')) as LiveEvent);
    } catch {
      // bỏ qua sự kiện hỏng
    }
  };

  async function connect() {
    if (closed) return;
    const token = options.getToken();
    if (!token) {
      scheduleRetry();
      return;
    }
    controller = new AbortController();
    try {
      const response = await fetch(options.url, {
        headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (response.status === 401) {
        await options.refreshToken().catch(() => undefined);
        scheduleRetry();
        return;
      }
      if (!response.ok || !response.body) {
        scheduleRetry();
        return;
      }
      attempt = 0;
      options.onStatus?.(true);
      options.onOpen?.();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
        let split = buffer.indexOf('\n\n');
        while (split >= 0) {
          dispatch(buffer.slice(0, split));
          buffer = buffer.slice(split + 2);
          split = buffer.indexOf('\n\n');
        }
      }
      // Máy chủ đóng luồng (hết 30 phút) → nối lại ngay
      attempt = 0;
      scheduleRetry();
    } catch {
      if (!closed) scheduleRetry();
    }
  }

  void connect();
  return () => {
    closed = true;
    window.clearTimeout(retryTimer);
    controller?.abort();
  };
}

/** Thời gian tương đối tiếng Việt: "Vừa xong", "5 phút trước"… */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 45) return 'Vừa xong';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}
