import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/common';
import ListingThumb from '@/components/listings/ListingThumb';
import { LISTING_CATEGORY_CONFIG, LISTING_CATEGORY_FILTER_OPTIONS } from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import { DASHBOARD_CARD_CLASS } from '@/pages/Dashboard/dashboardUtils';
import type { Listing, ListingCategory, TranslationKey } from '@/types';
import { formatDayTime } from '@/utils/format';
import { normalizeText } from '@/utils/string';

interface PendingListingsTableProps {
  listings: Listing[];
  totalPending: number;
  /** Số dòng hiển thị trong bảng xem nhanh */
  previewLimit: number;
  onApprove: (listing: Listing) => void;
  onView: (listing: Listing) => void;
  onViewAll: () => void;
}

const COLUMNS: { labelKey: TranslationKey; className: string }[] = [
  { labelKey: 'table.dashboardPending.place', className: 'rounded-l-xl px-4' },
  { labelKey: 'table.dashboardPending.partner', className: 'px-3' },
  { labelKey: 'table.dashboardPending.category', className: 'px-3' },
  { labelKey: 'table.dashboardPending.province', className: 'px-3' },
  { labelKey: 'table.dashboardPending.time', className: 'px-3' },
  { labelKey: 'table.dashboardPending.status', className: 'px-3 text-center' },
  { labelKey: 'table.dashboardPending.actions', className: 'rounded-r-xl px-4 text-right' },
];

export default function PendingListingsTable({
  listings,
  totalPending,
  previewLimit,
  onApprove,
  onView,
  onViewAll,
}: PendingListingsTableProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<ListingCategory | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const visibleListings = useMemo(() => {
    const normalized = normalizeText(keyword);
    return listings
      .filter((listing) => category === 'all' || listing.category === category)
      .filter(
        (listing) =>
          !normalized ||
          [listing.name, listing.partnerName, listing.id].some((field) =>
            normalizeText(field).includes(normalized),
          ),
      )
      .slice(0, previewLimit);
  }, [listings, keyword, category, previewLimit]);

  return (
    <div className={`${DASHBOARD_CARD_CLASS} xl:col-span-8`}>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed/60 text-tertiary">
            <Icon name="pending_actions" className="text-[22px]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
                {t('dashboard.pending.title')}
              </h2>
              <span className="rounded-full bg-tertiary px-2.5 py-0.5 font-label-sm text-[11px] font-bold text-on-tertiary">
                {t('dashboard.pending.newCount', { count: totalPending })}
              </span>
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {t('dashboard.pending.subtitle')}
            </p>
          </div>
        </div>

        {/* Tìm nhanh + lọc danh mục */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              name="search"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
            />
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('dashboard.pending.searchPlaceholder')}
              className="w-44 rounded-lg border border-transparent bg-surface-container-low py-1.5 pr-3 pl-9 text-[12px] text-on-surface transition-all focus:border-surface-container focus:bg-surface-container-lowest focus:outline-none sm:w-56"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
                category === 'all'
                  ? 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  : 'bg-primary text-on-primary'
              }`}
              title={t('dashboard.pending.filter')}
            >
              <Icon name="filter_list" className="text-[18px]" />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-lg ring-1 ring-surface-container">
                  {LISTING_CATEGORY_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCategory(option.value);
                        setFilterOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left font-label-md text-label-md transition-colors hover:bg-surface-container-low ${
                        category === option.value ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {option.label}
                      {category === option.value && <Icon name="check" className="text-[18px]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full table-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) => (
                <th key={column.labelKey} className={`py-3 ${column.className}`}>
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/40 font-body-sm text-[13px] text-on-surface">
            {visibleListings.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="task_alt" className="text-[36px] text-primary" />
                    <span className="font-label-md text-label-md">
                      {listings.length === 0
                        ? t('dashboard.pending.emptyAll')
                        : t('dashboard.pending.emptyFiltered')}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              visibleListings.map((listing) => {
                const config = LISTING_CATEGORY_CONFIG[listing.category];
                return (
                  <tr
                    key={listing.id}
                    className="transition-colors hover:bg-surface-container-low/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <ListingThumb
                          listing={listing}
                          className="h-10 w-10 rounded-lg"
                          iconClassName="text-[20px]"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onView(listing)}
                            className="block truncate text-left font-label-md text-[13px] font-semibold text-on-surface hover:text-primary hover:underline"
                          >
                            {listing.name}
                          </button>
                          <span className="font-label-sm text-[11px] text-on-surface-variant">
                            {t('dashboard.pending.code', { id: listing.id })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-primary">
                          <Icon name="person" className="text-[14px]" />
                        </div>
                        <span className="max-w-[130px] truncate text-[12px] font-medium">
                          {listing.partnerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-label-sm text-[11px] font-semibold ${config.badgeClass}`}
                      >
                        {config.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-[12px] text-on-surface-variant">
                      {PROVINCE_NAMES[listing.province]}
                    </td>
                    <td className="px-3 py-3.5 text-[12px] whitespace-nowrap text-on-surface-variant">
                      {formatDayTime(listing.submittedAt)}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="inline-flex items-center rounded-full bg-tertiary-fixed px-2 py-0.5 font-label-sm text-[11px] font-bold text-on-tertiary-fixed">
                        {t('status.listing.pending')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onApprove(listing)}
                          className="rounded-lg bg-primary px-3 py-1.5 font-label-sm text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary-container"
                        >
                          {t('actions.approve')}
                        </button>
                        <button
                          type="button"
                          onClick={() => onView(listing)}
                          className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                          title={t('actions.listingDetail')}
                        >
                          <Icon name="visibility" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-col justify-between gap-3 border-t border-surface-container/60 pt-5 sm:flex-row sm:items-center">
        <span className="font-body-sm text-[12px] text-on-surface-variant">
          <Trans
            i18nKey="dashboard.pending.summary"
            values={{ shown: visibleListings.length, total: totalPending }}
            components={{ bold: <strong className="font-semibold text-on-surface" /> }}
          />
        </span>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-surface-container-low px-4 py-2 font-label-md text-[13px] font-semibold text-primary transition-colors hover:bg-surface-container"
        >
          <span>{t('dashboard.pending.viewAll', { count: totalPending })}</span>
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
