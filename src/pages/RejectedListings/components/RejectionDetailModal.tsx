import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { RESUBMISSION_CONFIG } from '../../../constants/listing';
import type { Listing } from '../../../types/admin';
import { formatDate, formatDayTime, toIsoDate } from '../../../utils/format';
import {
  getRejectionReason,
  getResubmissionLabel,
  getResubmissionStatus,
  getResubmitDeadline,
} from '../rejectedUtils';

interface RejectionDetailModalProps {
  listing: Listing;
  onClose: () => void;
  onReReview: (listing: Listing) => void;
  onRemind: (listing: Listing) => void;
  onLock: (listing: Listing) => void;
}

const SECONDARY_BUTTON_CLASS =
  'flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high';

export default function RejectionDetailModal({
  listing,
  onClose,
  onReReview,
  onRemind,
  onLock,
}: RejectionDetailModalProps) {
  const status = getResubmissionStatus(listing);
  const statusConfig = RESUBMISSION_CONFIG[status];
  const reason = getRejectionReason(listing);
  const deadline = getResubmitDeadline(listing);

  const facts = [
    {
      icon: 'business_center',
      label: 'Đối tác gửi',
      value: `${listing.partnerName} (${listing.partnerId ?? '—'})`,
    },
    {
      icon: 'event_busy',
      label: 'Ngày từ chối',
      value: listing.reviewedAt ? formatDayTime(listing.reviewedAt) : '—',
    },
    {
      icon: 'event',
      label: 'Hạn gửi lại',
      value: deadline ? formatDate(toIsoDate(deadline)) : '—',
    },
    { icon: 'location_on', label: 'Địa chỉ', value: listing.address },
  ];

  return (
    <Modal
      title="Chi tiết lý do từ chối"
      description={`${listing.name} • ${listing.id}`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          {status === 'resubmitted' && (
            <Button icon="visibility" onClick={() => onReReview(listing)}>
              Xem xét lại hồ sơ
            </Button>
          )}
          {(status === 'waiting' || status === 'overdue') && (
            <>
              <button
                type="button"
                onClick={() => onLock(listing)}
                className={SECONDARY_BUTTON_CLASS}
              >
                <Icon name="lock" className="text-[18px] text-error" /> Đóng vĩnh viễn
              </button>
              <Button icon="forward_to_inbox" onClick={() => onRemind(listing)}>
                Gửi nhắc nhở bổ sung
              </Button>
            </>
          )}
          {status === 'locked' && (
            <button type="button" onClick={onClose} className={SECONDARY_BUTTON_CLASS}>
              Đóng
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-4">
          <Icon
            name={listing.rejectIcon ?? reason.icon}
            className={`mt-0.5 shrink-0 text-[22px] ${reason.toneClass}`}
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
              {reason.shortLabel}
            </span>
            <p className="font-body-md text-body-md leading-relaxed font-medium text-on-surface">
              {listing.rejectReason ?? reason.title}
            </p>
          </div>
        </div>

        {listing.partnerFeedback && (
          <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
              Góp ý đã gửi cho đối tác
            </span>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface">
              {listing.partnerFeedback}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-start gap-3 rounded-xl bg-surface-container-low/60 p-3"
            >
              <Icon name={fact.icon} className="mt-0.5 text-[18px] text-primary" />
              <div className="flex min-w-0 flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  {fact.label}
                </span>
                <span className="font-body-md text-body-md font-medium break-words text-on-surface">
                  {fact.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Trạng thái gửi lại:
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-label-sm ${statusConfig.badgeClass}`}
          >
            <Icon name={statusConfig.icon} className="text-[15px]" />
            {getResubmissionLabel(listing)}
          </span>
        </div>
      </div>
    </Modal>
  );
}
