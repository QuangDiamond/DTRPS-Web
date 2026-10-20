import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import SortableHeader from '../../../components/common/SortableHeader';
import type { Poi } from '../../../types/admin';
import type { SortState } from '../../../utils/sort';
import type { PoiSortKey } from '../locationsUtils';
import PoiTableRow from './PoiTableRow';

interface PoiTableProps {
  pois: Poi[];
  onEdit: (poi: Poi) => void;
  onView: (poi: Poi) => void;
  onResetFilters: () => void;
  sort: SortState<PoiSortKey> | null;
  onSort: (key: PoiSortKey) => void;
  /** Chân bảng (phân trang) */
  footer: ReactNode;
}

const COLUMNS: { label: string; className: string; sortKey?: PoiSortKey }[] = [
  { label: 'Tên POI & Hình ảnh', className: 'px-space-lg', sortKey: 'name' },
  { label: 'Mã POI', className: 'px-space-md', sortKey: 'id' },
  { label: 'Danh mục', className: 'px-space-md' },
  { label: 'Vị trí / Tỉnh thành', className: 'px-space-md', sortKey: 'location' },
  { label: 'Mức giá dự kiến', className: 'px-space-md' },
  { label: 'Nguồn dữ liệu', className: 'px-space-md' },
  { label: 'Đánh giá', className: 'px-space-md', sortKey: 'rating' },
  { label: 'Trạng thái', className: 'px-space-md', sortKey: 'status' },
  { label: 'Hành động', className: 'px-space-lg text-right' },
];

export default function PoiTable({
  pois,
  onEdit,
  onView,
  onResetFilters,
  sort,
  onSort,
  footer,
}: PoiTableProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) =>
                column.sortKey ? (
                  <SortableHeader
                    key={column.label}
                    label={column.label}
                    sortKey={column.sortKey}
                    sort={sort}
                    onSort={onSort}
                    className={`py-space-md font-semibold whitespace-nowrap ${column.className}`}
                  />
                ) : (
                  <th
                    key={column.label}
                    className={`py-space-md font-semibold whitespace-nowrap ${column.className}`}
                  >
                    {column.label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
            {pois.map((poi) => (
              <PoiTableRow key={poi.id} poi={poi} onEdit={onEdit} onView={onView} />
            ))}
            {pois.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-outline">
                    <Icon name="wrong_location" className="text-[40px]" />
                    <span className="font-body-md text-body-md">
                      Không tìm thấy điểm đến phù hợp với bộ lọc
                    </span>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="font-label-md text-label-md text-primary hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
