import i18n from 'i18next';
import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import { getAccessToken } from './tokenStore';

/** Lỗi trả về từ API (hoặc lỗi mạng) — luôn có message tiếng Việt để hiển thị cho người dùng */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: HttpMethod;
  /** Dữ liệu gửi lên — tự chuyển sang JSON */
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Không kích hoạt đăng xuất tự động khi nhận 401 (dùng cho chính request đăng xuất) */
  silentUnauthorized?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

/** Đăng ký hành động khi API trả 401 (AuthProvider dùng để đăng xuất) */
export function onUnauthorized(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value));
  });
  const search = params.toString();
  return search ? `${url}?${search}` : url;
}

function messageFromPayload(payload: unknown): string | undefined {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message: unknown };
    if (typeof message === 'string' && message.trim()) return message;
  }
  return undefined;
}

const STATUS_MESSAGES: Record<number, string> = {
  get 400() {
    return i18n.t('services.httpClient.theSubmittedDataInvalid');
  },
  get 401() {
    return i18n.t('services.httpClient.yourSessionHasExpired');
  },
  get 403() {
    return i18n.t('services.httpClient.youDoNotHave');
  },
  get 404() {
    return i18n.t('services.httpClient.theRequestedDataWas');
  },
  get 409() {
    return i18n.t('services.httpClient.theDataWasChanged');
  },
  get 422() {
    return i18n.t('services.httpClient.theDataDoesNot');
  },
  get 500() {
    return i18n.t('services.httpClient.theServerEncounteredProblem');
  },
};

/** Gọi REST API, trả về JSON đã ép kiểu T. Ném ApiError khi lỗi mạng / HTTP không thành công. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, silentUnauthorized = false } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  // Server trả nội dung nghiệp vụ (tên giấy tờ, ghi chú...) theo ngôn ngữ giao diện đang chọn
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': i18n.resolvedLanguage ?? 'vi',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError';
    throw new ApiError(
      aborted
        ? i18n.t('services.httpClient.theServerTookToo')
        : i18n.t('services.httpClient.couldNotConnectServer'),
      0,
      error,
    );
  } finally {
    window.clearTimeout(timeout);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !silentUnauthorized) unauthorizedHandler?.();
    throw new ApiError(
      messageFromPayload(payload) ??
        STATUS_MESSAGES[response.status] ??
        i18n.t('services.httpClient.requestFailedCode', { status: response.status }),
      response.status,
      payload,
    );
  }
  return payload as T;
}
