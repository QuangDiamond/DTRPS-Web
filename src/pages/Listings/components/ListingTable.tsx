import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon, SortableHeader } from '@/components/common';
import type { ListingSortKey } from '@/pages/Listings/listingUtils';
import type { Listing, TranslationKey } from '@/types';
import type { SortState } from '@/utils/sort';
import ListingRow from './ListingRow';

interface ListingTableProps {
  listings: Listing[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
  onOpenMap: (listing: Listing) => void;
  /** Độ tương đồng AI (%) theo id khi đang dùng tìm kiếm AI */
  sort: SortState<ListingSortKey> | null;
  onSort: (key: ListingSortKey) => void;
  footer: ReactNode;
}

const COLUMNS: { labelKey: TranslationKey; sortKey: ListingSortKey }[] = [
  { labelKey: 'table.listings.place', sortKey: 'name' },
  { labelKey: 'table.listings.partner', sortKey: 'partner' },
  { labelKey: 'table.listings.category', sortKey: 'category' },
  { labelKey: 'table.listings.province', sortKey: 'province' },
  { labelKey: 'table.listings.wait', sortKey: 'wait' },
  { labelKey: 'table.listings.status', sortKey: 'status' },
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
  const { t } = useTranslation();
  const allSelected =
    listings.length > 0 && listings.every((listing) => selectedIds.has(listing.id));

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <div className="table-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="w-12 px-5 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label={t('table.selectAllOnPage')}
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) => (
                <SortableHeader
                  key={column.sortKey}
                  label={t(column.labelKey)}
                  sortKey={column.sortKey}
                  sort={sort}
                  onSort={onSort}
                  className="px-4 py-4 font-semibold"
                />
              ))}
              <th className="px-5 py-4 text-center font-semibold">{t('table.listings.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('listings.listingTable.noMatchingSubmissions')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('listings.listingTable.tryAnotherStatusTab')}
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
