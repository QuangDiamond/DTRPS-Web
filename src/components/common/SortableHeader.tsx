import { useTranslation } from 'react-i18next';
import type { SortState } from '@/utils/sort';
import Icon from './Icon';

interface SortableHeaderProps<K extends string> {
  label: string;
  sortKey: K;
  sort: SortState<K> | null;
  onSort: (key: K) => void;
  /** Class của thẻ <th> (padding, căn lề...) */
  className?: string;
}

/** Ô tiêu đề cột bấm được để sắp xếp, có aria-sort cho trình đọc màn hình */
export default function SortableHeader<K extends string>({
  label,
  sortKey,
  sort,
  onSort,
  className = '',
}: SortableHeaderProps<K>) {
  const { t } = useTranslation();
  const direction = sort?.key === sortKey ? sort.direction : null;
  const icon =
    direction === 'asc' ? 'arrow_upward' : direction === 'desc' ? 'arrow_downward' : 'unfold_more';

  return (
    <th
      className={className}
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={t('components.sortableHeader.sortBy', { toLowerCase: label.toLowerCase() })}
        className={`group inline-flex items-center gap-1 [text-transform:inherit] transition-colors hover:text-on-surface ${
          direction ? 'text-primary' : ''
        }`}
      >
        {label}
        <Icon
          name={icon}
          className={`text-[16px] ${direction ? '' : 'opacity-40 group-hover:opacity-100'}`}
        />
      </button>
    </th>
  );
}
