import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon, SortableHeader } from '@/components/common';
import type { PoiSortKey } from '@/pages/Pois/poiListUtils';
import type { Poi, TranslationKey } from '@/types';
import type { SortState } from '@/utils/sort';
import PoiTableRow from './PoiTableRow';

interface PoiTableProps {
  pois: Poi[];
  onEdit: (poi: Poi) => void;
  onView: (poi: Poi) => void;
  /** Độ tương đồng AI (%) theo id khi đang dùng tìm kiếm AI */
  matchScores?: Map<string, number> | null;
  onResetFilters: () => void;
  sort: SortState<PoiSortKey> | null;
  onSort: (key: PoiSortKey) => void;
  /** Chân bảng (phân trang) */
  footer: ReactNode;
}

const COLUMNS: { labelKey: TranslationKey; className: string; sortKey?: PoiSortKey }[] = [
  { labelKey: 'table.pois.name', className: 'px-space-lg', sortKey: 'name' },
  { labelKey: 'table.pois.id', className: 'px-space-md', sortKey: 'id' },
  { labelKey: 'table.pois.category', className: 'px-space-md' },
  { labelKey: 'table.pois.location', className: 'px-space-md', sortKey: 'location' },
  { labelKey: 'table.pois.price', className: 'px-space-md' },
  { labelKey: 'table.pois.source', className: 'px-space-md' },
  { labelKey: 'table.pois.rating', className: 'px-space-md', sortKey: 'rating' },
  { labelKey: 'table.pois.status', className: 'px-space-md', sortKey: 'status' },
  { labelKey: 'table.pois.vector', className: 'px-space-md' },
  { labelKey: 'table.pois.actions', className: 'px-space-lg text-right' },
];

export default function PoiTable({
  pois,
  matchScores,
  onEdit,
  onView,
  onResetFilters,
  sort,
  onSort,
  footer,
}: PoiTableProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="table-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) =>
                column.sortKey ? (
                  <SortableHeader
                    key={column.labelKey}
                    label={t(column.labelKey)}
                    sortKey={column.sortKey}
                    sort={sort}
                    onSort={onSort}
                    className={`py-space-md font-semibold whitespace-nowrap ${column.className}`}
                  />
                ) : (
                  <th
                    key={column.labelKey}
                    className={`py-space-md font-semibold whitespace-nowrap ${column.className}`}
                  >
                    {t(column.labelKey)}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
            {pois.map((poi) => (
              <PoiTableRow
                key={poi.id}
                poi={poi}
                matchScore={matchScores?.get(poi.id)}
                onEdit={onEdit}
                onView={onView}
              />
            ))}
            {pois.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-outline">
                    <Icon name="wrong_location" className="text-[40px]" />
                    <span className="font-body-md text-body-md">
                      {t('pois.poiTable.noDestinationsMatchFilters')}
                    </span>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="font-label-md text-label-md text-primary hover:underline"
                    >
                      {t('pois.poiTable.clearFilters')}
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
