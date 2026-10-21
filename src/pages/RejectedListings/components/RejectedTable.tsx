import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import type { Listing, TranslationKey } from '@/types';
import RejectedRow from './RejectedRow';

interface RejectedTableProps {
  listings: Listing[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onBulkRemind: () => void;
  onBulkLock: () => void;
  onReReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
  footer: ReactNode;
}

const COLUMNS: { labelKey: TranslationKey; className: string }[] = [
  { labelKey: 'table.rejected.place', className: 'min-w-[280px] px-3' },
  { labelKey: 'table.rejected.partner', className: 'min-w-[200px] px-3' },
  { labelKey: 'table.rejected.reason', className: 'min-w-[260px] px-3' },
  { labelKey: 'table.rejected.rejectedAt', className: 'min-w-[150px] px-3' },
  { labelKey: 'table.rejected.resubmission', className: 'min-w-[190px] px-3' },
];

const BULK_BUTTON_CLASS =
  'rounded-lg bg-surface-container-lowest px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm hover:bg-surface-container';

export default function RejectedTable({
  listings,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onClearSelection,
  onBulkRemind,
  onBulkLock,
  onReReview,
  onShowReason,
  footer,
}: RejectedTableProps) {
  const { t } = useTranslation();
  const selectedOnPage = listings.filter((listing) => selectedIds.has(listing.id)).length;
  const allSelected = listings.length > 0 && selectedOnPage === listings.length;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-2px_rgba(15,118,110,0.06)]">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-error-container/30 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md font-semibold text-on-error-container">
              {t('rejectedListings.rejectedTable.submissionsSelected', { count: selectedIds.size })}
            </span>
            <button type="button" onClick={onBulkRemind} className={BULK_BUTTON_CLASS}>
              {t('rejectedListings.rejectedTable.sendUpdateReminder')}
            </button>
            <button type="button" onClick={onBulkLock} className={BULK_BUTTON_CLASS}>
              {t('rejectedListings.rejectedTable.permanentlyClosed')}
            </button>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            title={t('rejectedListings.rejectedTable.clearSelection')}
            className="text-on-surface-variant hover:text-error"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}

      <div className="table-scroll overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/80 font-label-md text-label-md text-on-surface-variant">
              <th className="w-10 py-3.5 pr-2 pl-5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = selectedOnPage > 0 && !allSelected;
                  }}
                  onChange={(event) => onToggleSelectAll(event.target.checked)}
                  aria-label={t('table.selectAllOnPage')}
                  className="h-4 w-4 cursor-pointer rounded accent-primary"
                />
              </th>
              {COLUMNS.map((column) => (
                <th key={column.labelKey} className={`py-3.5 ${column.className}`}>
                  {t(column.labelKey)}
                </th>
              ))}
              <th className="w-40 py-3.5 pr-5 pl-3 text-right">{t('table.rejected.actions')}</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {listings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('rejectedListings.rejectedTable.noMatchingSubmissions')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('rejectedListings.rejectedTable.tryDifferentKeywordOr')}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <RejectedRow
                  key={listing.id}
                  listing={listing}
                  selected={selectedIds.has(listing.id)}
                  onToggleSelect={onToggleSelect}
                  onReReview={onReReview}
                  onShowReason={onShowReason}
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
