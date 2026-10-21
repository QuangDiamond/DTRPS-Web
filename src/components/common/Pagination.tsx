import { Trans, useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/format';
import { getPageItems } from '@/utils/pagination';
import Icon from './Icon';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  /** Đơn vị hiển thị, ví dụ "đối tác", "người dùng" */
  itemLabel: string;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  totalItems,
  itemLabel,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-container bg-surface-container-lowest px-6 py-4 sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          <Trans
            i18nKey="components.pagination.showing"
            values={{ start, end, totalItems: formatNumber(totalItems), itemLabel }}
            components={{
              c0: <span className="font-semibold text-on-surface" />,
              c1: <span className="font-semibold text-on-surface" />,
            }}
          />
        </span>
        <span className="text-outline-variant">•</span>
        <div className="flex items-center gap-1 text-body-sm text-on-surface-variant">
          <span>{t('components.pagination.rowsPerPage')}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="cursor-pointer rounded-lg bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-on-surface outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 items-center gap-1 rounded-lg px-3 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high disabled:opacity-40"
        >
          <Icon name="chevron_left" className="text-[18px]" />
          <span>{t('components.pagination.previous')}</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageItems(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="w-6 text-center font-bold text-outline">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`h-8 w-8 rounded-lg font-label-md text-label-md transition-all ${
                  item === page
                    ? 'bg-primary font-bold text-on-primary shadow-sm'
                    : 'font-medium text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 items-center gap-1 rounded-lg px-3 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high disabled:opacity-40"
        >
          <span>Sau</span>
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
