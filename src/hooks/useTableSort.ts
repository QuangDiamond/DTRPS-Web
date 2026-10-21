import { useCallback, useState } from 'react';
import type { SortState } from '@/utils/sort';

/** Trạng thái sắp xếp bảng: bấm cột lần lượt → tăng dần → giảm dần → bỏ sắp xếp */
export function useTableSort<K extends string>(initial: SortState<K> | null = null) {
  const [sort, setSort] = useState<SortState<K> | null>(initial);

  const toggleSort = useCallback((key: K) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      return current.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  }, []);

  return { sort, toggleSort };
}
