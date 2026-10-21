/**
 * Helper chung của các service: mỗi hàm tự chọn nguồn dữ liệu theo cờ USE_MOCK_API,
 * nên khi chuyển sang backend thật chỉ cần đặt VITE_USE_MOCK=false.
 */
import type { DataSource } from '@/types';
import { MOCK_WRITE_LATENCY_MS, USE_MOCK_API } from './config';
import { apiRequest, type RequestOptions } from './httpClient';

type WriteMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Giả lập một phản hồi API thành công sau khoảng trễ `latency` ms */
export function mockResponse<T>(value: T, latency = 0): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), latency));
}

/** Đọc dữ liệu: mock → mockValue(); API → GET path */
export function readRequest<T>(
  path: string,
  mockValue: () => T,
  query?: RequestOptions['query'],
): Promise<T> {
  return USE_MOCK_API ? mockResponse(mockValue()) : apiRequest<T>(path, { query });
}

/** Ghi dữ liệu: mock → thành công sau độ trễ nhỏ; API → gửi body tới path */
export function writeRequest(path: string, method: WriteMethod, body?: unknown): Promise<void> {
  return USE_MOCK_API
    ? mockResponse(undefined, MOCK_WRITE_LATENCY_MS)
    : apiRequest<void>(path, { method, body });
}

/** Ghi dữ liệu và nhận kết quả từ server (mock trả về mockResult) */
export function writeRequestWithResult<T>(
  path: string,
  method: WriteMethod,
  body: unknown,
  mockResult: () => T,
): Promise<T> {
  return USE_MOCK_API
    ? mockResponse(mockResult(), MOCK_WRITE_LATENCY_MS)
    : apiRequest<T>(path, { method, body });
}

/** Dữ liệu có sẵn ngay ở chế độ mock (undefined khi dùng API — cần tải) */
export function peek<T>(mockValue: () => T): T | undefined {
  return USE_MOCK_API ? mockValue() : undefined;
}

/** Nguồn dữ liệu khởi tạo cho một store */
export function createSource<S>(path: string, mockSnapshot: S): DataSource<S> {
  return {
    seed: USE_MOCK_API ? mockSnapshot : undefined,
    load: () => readRequest(path, () => mockSnapshot),
  };
}
