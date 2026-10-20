import Icon from '../../../components/common/Icon';
import { formatNumber } from '../../../utils/format';
import { getPageItems } from '../../../utils/pagination';

interface NotificationPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ARROW_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent';

export default function NotificationPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: NotificationPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <span className="font-body-sm text-body-sm text-outline">
        Hiển thị{' '}
        <strong>
          {start}-{end}
        </strong>{' '}
        trong <strong>{formatNumber(totalItems)}</strong> thông báo
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={ARROW_CLASS}
        >
          <Icon name="chevron_left" className="text-[18px]" />
        </button>
        {getPageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-1 text-outline">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`flex h-8 w-8 items-center justify-center rounded-full font-label-sm text-label-sm transition-colors ${
                item === page
                  ? 'bg-primary font-bold text-on-primary shadow-sm'
                  : 'font-semibold text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          title="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={ARROW_CLASS}
        >
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
