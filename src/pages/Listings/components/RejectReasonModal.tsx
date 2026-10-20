import Button from '../../../components/common/Button';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import type { Listing } from '../../../types/admin';
import { formatDayTime } from '../../../utils/format';

interface RejectReasonModalProps {
  listing: Listing;
  onClose: () => void;
  onOpenDetail: (listing: Listing) => void;
}

export default function RejectReasonModal({
  listing,
  onClose,
  onOpenDetail,
}: RejectReasonModalProps) {
  return (
    <Modal
      title="Lý do từ chối hồ sơ"
      description={`${listing.name} • ${listing.id}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" icon="info" onClick={() => onOpenDetail(listing)}>
          Xem toàn bộ hồ sơ
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-xl bg-error-container/40 p-4 text-error">
          <Icon name="error_outline" className="shrink-0 text-[22px]" />
          <p className="font-body-md text-body-md leading-relaxed">
            {listing.rejectReason ?? 'Không ghi nhận lý do cụ thể.'}
          </p>
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
        {listing.reviewedAt && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Thời điểm từ chối: {formatDayTime(listing.reviewedAt)} • Đối tác: {listing.partnerName}
          </span>
        )}
      </div>
    </Modal>
  );
}
