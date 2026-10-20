import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { Listing } from '../../../types/admin';
import ListingRow from './ListingRow';

interface ListingTableProps {
  listings: Listing[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
  onOpenMap: (listing: Listing) => void;
  footer: ReactNode;
}

const COLUMNS = [
  'Địa điểm & Mã POI',
  'Đối tác gửi',
  'Phân loại',
  'Vị trí & Tỉnh thành',
  'Thời gian chờ',
  'Trạng thái',
];

export default function ListingTable({
  listings,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onReview,
  onShowReason,
  onOpenMap,
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
                <th key={column} className="px-4 py-4 font-semibold">
                  {column}
                </th>
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
