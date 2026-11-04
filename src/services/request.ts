/** Helper chung của các service: mọi hàm đều gọi API thật tại API_URL. */
import type { DataSource } from '@/types';
import { apiRequest, type RequestOptions } from './httpClient';

type WriteMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Đọc dữ liệu: GET path */
export function readRequest<T>(path: string, query?: RequestOptions['query']): Promise<T> {
  return apiRequest<T>(path, { query });
}

/** Ghi dữ liệu: gửi body tới path */
export function writeRequest(path: string, method: WriteMethod, body?: unknown): Promise<void> {
  return apiRequest<void>(path, { method, body });
}

/** Ghi dữ liệu và nhận kết quả từ server */
export function writeRequestWithResult<T>(
  path: string,
  method: WriteMethod,
  body: unknown,
): Promise<T> {
  return apiRequest<T>(path, { method, body });
}

/** Nguồn dữ liệu khởi tạo cho một store (luôn tải từ server) */
export function createSource<S>(path: string): DataSource<S> {
  return {
    seed: undefined,
    load: () => readRequest<S>(path),
  };
}
