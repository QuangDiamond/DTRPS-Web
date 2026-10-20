import Icon from '../../../components/common/Icon';
import ListingThumb from '../../../components/listings/ListingThumb';
import { RESUBMISSION_CONFIG } from '../../../constants/listing';
import type { Listing } from '../../../types/admin';
import { formatDateWithPeriod } from '../../../utils/format';
import { getRejectionReason, getResubmissionLabel, getResubmissionStatus } from '../rejectedUtils';

interface RejectedRowProps {
  listing: Listing;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onReReview: (listing: Listing) => void;
  onShowReason: (listing: Listing) => void;
}

const THUMB_OPACITY = { resubmitted: '', waiting: '', overdue: 'opacity-80', locked: 'opacity-70' };

export default function RejectedRow({
  listing,
  selected,
  onToggleSelect,
  onReReview,
  onShowReason,
}: RejectedRowProps) {
  const status = getResubmissionStatus(listing);
  const statusConfig = RESUBMISSION_CONFIG[status];
  const reason = getRejectionReason(listing);
  const rejectedAt = formatDateWithPeriod(listing.reviewedAt);
  const isActive = status === 'resubmitted' || status === 'waiting';

  return (
    <tr
      className={`transition-colors hover:bg-surface-container-low/50 ${selected ? 'bg-primary/5' : ''}`}
    >
      <td className="py-4 pr-2 pl-5 align-middle">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(listing.id)}
          aria-label={`Chọn ${listing.name}`}
          className="h-4 w-4 cursor-pointer rounded accent-primary"
        />
      </td>

      {/* Địa điểm */}
      <td className="px-3 py-4 align-middle">
        <div className="flex items-center gap-3">
          <ListingThumb
            listing={listing}
            className={`h-12 w-12 rounded-xl ${THUMB_OPACITY[status]}`}
            iconClassName="text-[22px]"
          />
          <div className="flex min-w-0 flex-col">
            <button
              type="button"
              onClick={() => onShowReason(listing)}
              className="truncate text-left font-title-md text-title-md font-semibold text-on-surface hover:text-primary"
            >
              {listing.name}
            </button>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`rounded px-1.5 font-label-sm font-mono text-label-sm ${
                  isActive
                    ? 'bg-primary-fixed/40 text-on-primary-fixed'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {listing.id}
              </span>
              <span className="text-xs text-outline">•</span>
              <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                {listing.address}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Đối tác */}
      <td className="px-3 py-4 align-middle">
        <div className="flex flex-col">
          <span className="truncate font-label-md text-label-md font-medium text-on-surface">
            {listing.partnerName}
          </span>
          <span className="font-body-sm font-mono text-body-sm text-outline">
            {listing.partnerId ?? '—'}
          </span>
        </div>
      </td>

      {/* Lý do */}
      <td className="px-3 py-4 align-middle">
        <div className="flex max-w-xs items-start gap-2">
          <Icon
            name={listing.rejectIcon ?? reason.icon}
            className={`mt-0.5 shrink-0 text-[18px] ${reason.toneClass}`}
          />
          <span
            className={`font-body-sm text-body-sm leading-snug font-medium ${reason.toneClass}`}
          >
            {listing.rejectReason ?? reason.title}
          </span>
        </div>
      </td>

      {/* Ngày từ chối */}
      <td className="px-3 py-4 align-middle">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-medium text-on-surface">
            {rejectedAt.date}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {rejectedAt.time}
          </span>
        </div>
      </td>

      {/* Trạng thái gửi lại */}
      <td className="px-3 py-4 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm whitespace-nowrap ${statusConfig.badgeClass}`}
        >
          <Icon name={statusConfig.icon} className="text-[15px]" />
          {getResubmissionLabel(listing)}
        </span>
      </td>

      {/* Thao tác */}
      <td className="py-4 pr-5 pl-3 text-right align-middle">
        {status === 'resubmitted' ? (
          <button
            type="button"
            onClick={() => onReReview(listing)}
            className="ml-auto flex h-9 items-center justify-center gap-1 rounded-full bg-primary px-3.5 font-label-sm text-label-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <Icon name="visibility" className="text-[16px]" />
            <span>Xem xét lại</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onShowReason(listing)}
            className="ml-auto flex h-9 items-center justify-center gap-1 rounded-full bg-surface-container px-3 font-label-sm text-label-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="info" className="text-[16px]" />
            <span>Xem lý do</span>
          </button>
        )}
      </td>
    </tr>
  );
}
