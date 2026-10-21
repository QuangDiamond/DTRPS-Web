/**
 * Nhãn đa ngôn ngữ cho các bảng cấu hình trong constants/.
 * Trường nhãn được thay bằng getter đọc từ điển tại thời điểm render, nên mọi chỗ đang dùng
 * `CONFIG[x].label` tự hiển thị đúng ngôn ngữ mà không phải sửa nơi gọi.
 */
import i18n from 'i18next';
import type { SelectOption } from '@/types';

// Key ghép động (`status.listing.${id}`) nên không kiểm tra kiểu được như t() thông thường
const translate = (key: string, fallback: string): string =>
  (i18n.t as (key: string, options: { defaultValue: string }) => string)(key, {
    defaultValue: fallback,
  });

/** Một trường nhãn đơn lẻ, ví dụ ADMIN_ROOT_CRUMB.label */
export function localizeField<T extends object>(target: T, field: keyof T & string, key: string) {
  const fallback = String(target[field]);
  Object.defineProperty(target, field, {
    get: () => translate(key, fallback),
    enumerable: true,
    configurable: true,
  });
}

/**
 * Bảng cấu hình theo id, ví dụ LISTING_STATUS_CONFIG.
 * - `fields` chỉ có 1 trường → key `${namespace}.${id}`
 * - nhiều trường → key `${namespace}.${id}.${field}`
 */
export function localizeConfig<K extends string, V extends object>(
  namespace: string,
  config: Record<K, V>,
  fields: readonly (keyof V & string)[],
): Record<K, V> {
  for (const id of Object.keys(config) as K[]) {
    for (const field of fields) {
      const key = fields.length === 1 ? `${namespace}.${id}` : `${namespace}.${id}.${field}`;
      localizeField(config[id], field, key);
    }
  }
  return config;
}

/** Bảng nhãn dạng Record<id, string>, ví dụ USER_ACCOUNT_TYPE_LABELS */
export function localizeLabels<K extends string>(
  namespace: string,
  labels: Record<K, string>,
): Record<K, string> {
  for (const id of Object.keys(labels) as K[]) localizeField(labels, id, `${namespace}.${id}`);
  return labels;
}

/** Tùy chọn có nhãn lấy theo key cố định, ví dụ "Tất cả danh mục" */
export function localizedOption<T extends string>(
  value: T,
  key: string,
  fallback: string,
): SelectOption<T> {
  const option = { value, label: fallback };
  localizeField(option, 'label', key);
  return option;
}

/** Tùy chọn có nhãn đọc trực tiếp từ một bảng cấu hình đã localize */
export function linkedOption<T extends string>(value: T, getLabel: () => string): SelectOption<T> {
  return {
    value,
    get label() {
      return getLabel();
    },
  };
}
