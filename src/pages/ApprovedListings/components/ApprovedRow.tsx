import Icon from '../../../components/common/Icon';
import ListingThumb from '../../../components/listings/ListingThumb';
import { LISTING_CATEGORY_CONFIG, PARTNER_TIER_BADGE } from '../../../constants/listing';
import type { Listing } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';
import { formatApprovedAt, isHidden } from '../approvedUtils';

interface ApprovedRowProps {
  listing: Listing;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenDetail: (listing: Listing) => void;
  onEdit: (listing: Listing) => void;
  onHide: (listing: Listing) => void;
  onShow: (listing: Listing) => void;
}

const ICON_BUTTON_CLASS = 'rounded-lg p-2 transition-all';

export default function ApprovedRow({
  listing,
  selected,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onHide,
  onShow,
}: ApprovedRowProps) {
  const hidden = isHidden(listing);
  const badge = PARTNER_TIER_BADGE[listing.partnerTier];
  const approvedAt = formatApprovedAt(listing.reviewedAt);
  const hasRating = (listing.reviewCount ?? 0) > 0;

  return (
    <tr
      className={`group transition-colors hover:bg-surface-container-low/40 ${hidden ? 'opacity-85' : ''} ${
        selected ? 'bg-primary/5' : ''
      }`}
    >
      <td className="px-4 py-4 text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(listing.id)}
          aria-label={`Chọn ${listing.name}`}
          className="h-4 w-4 cursor-pointer rounded accent-primary"
        />
      </td>

      {/* Địa điểm */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl shadow-sm ${hidden ? 'grayscale-[30%]' : ''}`}
          >
            <ListingThumb
              listing={listing}
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-4 bg-linear-to-t from-inverse-surface/60 to-transparent" />
          </div>
          <div className="flex min-w-0 flex-col">
            <button
              type="button"
              onClick={() => onOpenDetail(listing)}
              className="truncate text-left font-title-md text-title-md text-on-surface transition-colors group-hover:text-primary"
            >
              {listing.name}
            </button>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="rounded bg-surface-container-high px-2 py-0.5 font-label-sm font-mono text-label-sm font-medium text-on-surface-variant">
                {listing.id}
              </span>
              {hasRating ? (
                <div
                  className={`flex items-center gap-0.5 ${hidden ? 'text-outline' : 'text-tertiary'}`}
                >
                  <Icon name="star" filled={!hidden} className="text-[14px]" />
                  <span className="font-label-sm text-label-sm font-semibold">
                    {listing.rating?.toFixed(1)}
                  </span>
                  <span className="text-[11px] text-outline">
                    ({formatNumber(listing.reviewCount ?? 0)})
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-outline">Chưa có đánh giá</span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Đối tác */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-medium text-on-surface">
            {listing.partnerName}
          </span>
          {badge.className ? (
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${badge.className}`}
              >
                {badge.icon && <Icon name={badge.icon} className="text-[13px]" />} {badge.label}
              </span>
            </div>
          ) : (
            <span className="mt-0.5 font-body-sm text-body-sm text-outline">{badge.label}</span>
          )}
        </div>
      </td>

      {/* Phân loại */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${
            LISTING_CATEGORY_CONFIG[listing.category].pillClass
          }`}
        >
          <Icon name={listing.categoryIcon} className="text-[14px]" />
          {listing.categoryLabel}
        </span>
      </td>

      {/* Thời gian phê duyệt */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md font-medium text-on-surface">
            {approvedAt.date}
          </span>
          <span className="font-body-sm text-body-sm text-outline">{approvedAt.time}</span>
        </div>
      </td>

      {/* Trạng thái hiển thị */}
      <td className="px-4 py-4">
        {hidden ? (
          <div className="inline-flex flex-col">
            <div className="inline-flex w-max items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
              <span className="h-2 w-2 rounded-full bg-outline" />
              <span>Tạm ẩn</span>
            </div>
            {listing.hiddenReason && (
              <span className="mt-1 font-body-sm text-[11px] text-outline">
                {listing.hiddenReason}
              </span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container">
            <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
            <span>Đang hiển thị</span>
          </div>
        )}
      </td>

      {/* Thao tác */}
      <td className="px-4 py-4 pr-6 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onOpenDetail(listing)}
            title="Xem chi tiết trên ứng dụng"
            className={`${ICON_BUTTON_CLASS} text-on-surface-variant hover:bg-surface-container hover:text-primary`}
          >
            <Icon name="open_in_new" className="text-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(listing)}
            title="Chỉnh sửa thông tin"
            className={`${ICON_BUTTON_CLASS} text-on-surface-variant hover:bg-surface-container hover:text-primary`}
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          {hidden ? (
            <button
              type="button"
              onClick={() => onShow(listing)}
              title="Mở hiển thị lại"
              className={`${ICON_BUTTON_CLASS} text-primary hover:bg-primary/10`}
            >
              <Icon name="visibility" className="text-[18px]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onHide(listing)}
              title="Tạm ẩn địa điểm"
              className={`${ICON_BUTTON_CLASS} text-on-surface-variant hover:bg-error-container/40 hover:text-error`}
            >
              <Icon name="visibility_off" className="text-[18px]" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
