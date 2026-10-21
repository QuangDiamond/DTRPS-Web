import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import type { Listing, TranslationKey } from '@/types';
import ApprovedRow from './ApprovedRow';

interface ApprovedTableProps {
  listings: Listing[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onBulkHide: () => void;
  onBulkAssignCategory: () => void;
  onOpenDetail: (listing: Listing) => void;
  onEdit: (listing: Listing) => void;
  onHide: (listing: Listing) => void;
  onShow: (listing: Listing) => void;
  footer: ReactNode;
}

const COLUMNS: TranslationKey[] = [
  'table.approved.place',
  'table.approved.owner',
  'table.approved.category',
  'table.approved.approvedAt',
  'table.approved.visibility',
];

const BULK_BUTTON_CLASS =
  'rounded-lg bg-surface-container-lowest px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm hover:bg-surface-container';

export default function ApprovedTable({
  listings,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onBulkHide,
  onBulkAssignCategory,
  onOpenDetail,
  onEdit,
  onHide,
  onShow,
  footer,
}: ApprovedTableProps) {
  const { t } = useTranslation();
  const selectedOnPage = listings.filter((listing) => selectedIds.has(listing.id)).length;
  const allSelected = listings.length > 0 && selectedOnPage === listings.length;
  const partiallySelected = selectedOnPage > 0 && !allSelected;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(15,118,110,0.06)]">
      {/* Thanh thao tác hàng loạt */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 px-space-lg py-2.5">
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md font-semibold text-primary">
              {t('approvedListings.approvedTable.itemsSelected', { count: selectedIds.size })}
            </span>
            <button type="button" onClick={onBulkHide} className={BULK_BUTTON_CLASS}>
              {t('approvedListings.approvedTable.hideSelected')}
            </button>
            <button type="button" onClick={onBulkAssignCategory} className={BULK_BUTTON_CLASS}>
              {t('approvedListings.approvedTable.assignCategory')}
            </button>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            title={t('approvedListings.approvedTable.clearSelection')}
            className="text-on-surface-variant hover:text-error"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      <div className="w-full table-scroll overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="w-12 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = partiallySelected;
                  }}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label={t('table.selectAllOnPage')}
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) => (
                <th key={column} className="px-4 py-3.5 font-semibold">
                  {t(column)}
                </th>
              ))}
              <th className="px-4 py-3.5 pr-6 text-right font-semibold">
                {t('table.approved.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm text-on-surface">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('approvedListings.approvedTable.noMatchingPlaces')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('approvedListings.approvedTable.tryDifferentKeywordOr')}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <ApprovedRow
                  key={listing.id}
                  listing={listing}
                  selected={selectedIds.has(listing.id)}
                  onToggleSelect={onToggleSelect}
                  onOpenDetail={onOpenDetail}
                  onEdit={onEdit}
                  onHide={onHide}
                  onShow={onShow}
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
