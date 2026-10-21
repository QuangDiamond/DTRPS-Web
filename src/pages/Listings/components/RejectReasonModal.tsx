import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/common';
import type { Listing } from '@/types';
import { formatDayTime } from '@/utils/format';

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
  const { t } = useTranslation();
  return (
    <Modal
      title={t('listings.rejectReasonModal.rejectionReason')}
      description={`${listing.name} • ${listing.id}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" icon="info" onClick={() => onOpenDetail(listing)}>
          {t('listings.rejectReasonModal.viewFullSubmission')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 rounded-xl bg-error-container/40 p-4 text-error">
          <Icon name="error_outline" className="shrink-0 text-[22px]" />
          <p className="font-body-md text-body-md leading-relaxed">
            {listing.rejectReason ?? t('listings.rejectReasonModal.noSpecificReasonWas')}
          </p>
        </div>
        {listing.partnerFeedback && (
          <div className="flex flex-col gap-1 rounded-xl bg-surface-container-low p-4">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase">
              {t('listings.rejectReasonModal.feedbackSentPartner')}
            </span>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface">
              {listing.partnerFeedback}
            </p>
          </div>
        )}
        {listing.reviewedAt && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('listings.rejectReasonModal.rejectedAtPartner', {
              reviewedAt: formatDayTime(listing.reviewedAt),
              partnerName: listing.partnerName,
            })}
          </span>
        )}
      </div>
    </Modal>
  );
}
