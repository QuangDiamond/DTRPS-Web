import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import SortableHeader from '../../../components/common/SortableHeader';
import type { Listing } from '../../../types/admin';
import type { SortState } from '../../../utils/sort';
import type { ListingSortKey } from '../listingUtils';
import ListingRow from './ListingRow';

interface ListingTableProps {
  listings: Listing[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
  onOpenMap: (listing: Listing) => void;
  sort: SortState<ListingSortKey> | null;
  onSort: (key: ListingSortKey) => void;
  footer: ReactNode;
}

const COLUMNS: { label: string; sortKey: ListingSortKey }[] = [
  { label: 'Địa điểm & Mã POI', sortKey: 'name' },
  { label: 'Đối tác gửi', sortKey: 'partner' },
  { label: 'Phân loại', sortKey: 'category' },
  { label: 'Vị trí & Tỉnh thành', sortKey: 'province' },
  { label: 'Thời gian chờ', sortKey: 'wait' },
  { label: 'Trạng thái', sortKey: 'status' },
];

export default function ListingTable({
  listings,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onReview,
  onShowReason,
  onOpenMap,
  sort,
  onSort,
  footer,
}: ListingTableProps) {
  const allSelected =
    listings.length > 0 && listings.every((listing) => selectedIds.has(listing.id));

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="w-12 px-5 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label="Chọn tất cả trên trang"
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) => (
                <SortableHeader
                  key={column.sortKey}
                  label={column.label}
                  sortKey={column.sortKey}
                  sort={sort}
                  onSort={onSort}
                  className="px-4 py-4 font-semibold"
                />
              ))}
              <th className="px-5 py-4 text-center font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">Không có hồ sơ phù hợp</span>
                    <span className="font-body-sm text-body-sm">
                      Thử đổi tab trạng thái hoặc bộ lọc.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  selected={selectedIds.has(listing.id)}
                  onToggleSelect={onToggleSelect}
                  onReview={onReview}
                  onShowReason={onShowReason}
                  onOpenMap={onOpenMap}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
