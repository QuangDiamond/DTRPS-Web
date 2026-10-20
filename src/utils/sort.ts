export type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/** Hàm lấy giá trị dùng để so sánh cho từng cột */
export type SortAccessors<T, K extends string> = Record<K, (item: T) => string | number>;

// So sánh theo bảng chữ cái tiếng Việt (Đ sau D, dấu thanh đúng thứ tự), số trong chuỗi so theo giá trị
const collator = new Intl.Collator('vi', { sensitivity: 'base', numeric: true });

/** Trả về mảng mới đã sắp xếp; sort = null giữ nguyên thứ tự mặc định */
export function sortItems<T, K extends string>(
  items: readonly T[],
  sort: SortState<K> | null,
  accessors: SortAccessors<T, K>,
): T[] {
  if (!sort) return [...items];
  const accessor = accessors[sort.key];
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = accessor(a);
    const right = accessor(b);
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : collator.compare(String(left), String(right));
    return result * factor;
  });
}
