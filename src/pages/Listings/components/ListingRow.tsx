import { useTranslation } from 'react-i18next';
import { Icon, VectorIndexBadge } from '@/components/common';
import ListingStatusBadge from '@/components/listings/ListingStatusBadge';
import ListingThumb from '@/components/listings/ListingThumb';
import { LISTING_CATEGORY_CONFIG, PARTNER_TIER_CONFIG } from '@/constants/listing';
import { getWaitDisplay, isOverdue } from '@/pages/Listings/listingUtils';
import type { Listing, ListingHighlight } from '@/types';
import { getListingSubTypeIcon, getListingSubTypeLabel } from '@/constants/listingMap';

interface ListingRowProps {
  listing: Listing;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
  onOpenMap: (listing: Listing) => void;
  /** Độ tương đồng AI (%) khi đang dùng tìm kiếm AI */
}

const HIGHLIGHT_TONE_CLASS: Record<ListingHighlight['tone'], string> = {
  primary: 'text-primary',
  tertiary: 'text-tertiary',
  muted: 'text-outline',
};

const ACTION_BUTTON_CLASS =
  'flex h-8 items-center gap-1.5 rounded-lg px-3 font-label-sm text-label-sm font-semibold whitespace-nowrap transition-all';
const ICON_BUTTON_CLASS =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface';

export default function ListingRow({
  listing,
  selected,
  onToggleSelect,
  onReview,
  onShowReason,
  onOpenMap,
}: ListingRowProps) {
  const { t } = useTranslation();
  const overdue = isOverdue(listing);
  const wait = getWaitDisplay(listing);
  const tier = PARTNER_TIER_CONFIG[listing.partnerTier];

  return (
    <tr
      className={`transition-colors hover:bg-surface-container-low/50 ${
        overdue ? 'bg-tertiary-fixed/15' : ''
      } ${selected ? 'bg-secondary-container/20' : ''}`}
    >
      <td className="px-5 py-4 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(listing.id)}
          aria-label={t('listings.listingRow.select', { name: listing.name })}
          className="h-4 w-4 cursor-pointer rounded accent-primary"
        />
      </td>

      {/* Địa điểm */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <ListingThumb listing={listing} className="h-14 w-14 rounded-xl" />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onReview(listing)}
                className="truncate text-left font-headline-sm text-headline-sm font-semibold text-on-surface transition-colors hover:text-primary"
              >
                {listing.name}
              </button>
              <VectorIndexBadge indexed={listing.vectorEmbedded} />
              {overdue && (
                <span className="shrink-0 rounded bg-error-container px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-error-container">
                  {t('listings.listingRow.over24h')}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {listing.id}
              </span>
              {listing.highlight && (
                <>
                  <span className="h-1 w-1 rounded-full bg-outline-variant" />
                  <span
                    className={`flex items-center gap-0.5 font-body-sm text-body-sm ${
                      HIGHLIGHT_TONE_CLASS[listing.highlight.tone]
                    }`}
                  >
                    {listing.highlight.icon && (
                      <Icon name={listing.highlight.icon} className="text-[14px]" />
                    )}
                    {listing.highlight.text}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Đối tác */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="person" className="text-[18px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {listing.partnerName}
            </span>
            <span className={`font-label-sm text-label-sm ${tier.className}`}>{tier.label}</span>
          </div>
        </div>
      </td>

      {/* Phân loại */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-medium whitespace-nowrap ${
            LISTING_CATEGORY_CONFIG[listing.category].pillClass
          }`}
        >
          <Icon name={getListingSubTypeIcon(listing)} className="text-[14px]" />{' '}
          {getListingSubTypeLabel(listing)}
        </span>
      </td>

      {/* Vị trí */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
          <Icon name="location_on" className="text-[16px] text-outline" />
          <span>{listing.address}</span>
        </div>
      </td>

      {/* Thời gian chờ */}
      <td className="px-4 py-4">
        <div className="flex flex-col whitespace-nowrap">
          <span className={`font-label-md text-label-md ${wait.primaryClass}`}>{wait.primary}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {wait.secondary}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <ListingStatusBadge status={listing.status} />
      </td>

      {/* Thao tác theo trạng thái */}
      <td className="px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {listing.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => onReview(listing)}
                className={`${ACTION_BUTTON_CLASS} bg-brand text-on-primary shadow-sm hover:bg-primary-container`}
                title={t('listings.listingRow.openDetailedReviewScreen')}
              >
                <Icon name="rate_review" className="text-[16px]" />
                <span>{t('listings.listingRow.reviewApprove')}</span>
              </button>
              <button
                type="button"
                onClick={() => onReview(listing)}
                className={ICON_BUTTON_CLASS}
                title={t('actions.viewDetail')}
              >
                <Icon name="visibility" className="text-[18px]" />
              </button>
            </>
          )}

          {listing.status === 'approved' && (
            <>
              <button
                type="button"
                onClick={() => onReview(listing)}
                className={`${ACTION_BUTTON_CLASS} bg-surface-container-high text-primary hover:bg-surface-container-highest`}
                title={t('listings.listingRow.viewSubmissionDetails')}
              >
                <Icon name="info" className="text-[16px]" />
                <span>{t('actions.viewDetail')}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenMap(listing)}
                className={ICON_BUTTON_CLASS}
                title={t('actions.viewOnMap')}
              >
                <Icon name="visibility" className="text-[18px]" />
              </button>
            </>
          )}

          {listing.status === 'rejected' && (
            <>
              <button
                type="button"
                onClick={() => onShowReason(listing)}
                className={`${ACTION_BUTTON_CLASS} bg-error-container/60 text-error hover:bg-error-container`}
                title={t('listings.listingRow.viewRejectionReason')}
              >
                <Icon name="error_outline" className="text-[16px]" />
                <span>{t('listings.listingRow.viewReason')}</span>
              </button>
              <button
                type="button"
                onClick={() => onReview(listing)}
                className={ICON_BUTTON_CLASS}
                title={t('actions.viewDetail')}
              >
                <Icon name="visibility" className="text-[18px]" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
