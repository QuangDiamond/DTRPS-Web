import Icon from '../../../components/common/Icon';
import { formatNumber } from '../../../utils/format';
import { getPageItems } from '../../../utils/pagination';

interface PoiTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  /** "điểm đến toàn quốc" hoặc "điểm đến phù hợp" khi đang lọc */
  itemLabel: string;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const NAV_BUTTON_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container disabled:text-outline disabled:opacity-30 disabled:hover:bg-transparent';

/** Chân bảng POI theo thiết kế Stitch (có nút về trang đầu / trang cuối) */
export default function PoiTablePagination({
  page,
  pageSize,
  totalItems,
  itemLabel,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PoiTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <div className="flex flex-col items-center justify-between gap-space-md bg-surface-container-low/50 px-space-lg py-space-md sm:flex-row">
      <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="cursor-pointer rounded-lg bg-surface-container-lowest px-2 py-1 font-semibold text-on-surface outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>
          trên tổng số <strong>{formatNumber(totalItems)}</strong> {itemLabel}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Trang đầu"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className={NAV_BUTTON_CLASS}
        >
          <Icon name="first_page" className="text-[18px]" />
        </button>
        <button
          type="button"
          title="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={NAV_BUTTON_CLASS}
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
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-label-md text-label-md transition-colors ${
                item === page
                  ? 'bg-primary font-semibold text-on-primary'
                  : 'font-medium text-on-surface hover:bg-surface-container'
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
          className={NAV_BUTTON_CLASS}
        >
          <Icon name="chevron_right" className="text-[18px]" />
        </button>
        <button
          type="button"
          title="Trang cuối"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className={NAV_BUTTON_CLASS}
        >
          <Icon name="last_page" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
