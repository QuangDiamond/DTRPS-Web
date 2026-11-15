import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import type { AdminPlaceReview } from '@/types';
import RatingStars from './RatingStars';

const MAX_REASON_LENGTH = 1000;

interface ReviewStatusModalProps {
  review: AdminPlaceReview;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Ẩn / hiện lại một đánh giá địa điểm — lý do bắt buộc, được gửi tới người viết */
export default function ReviewStatusModal({
  review,
  busy,
  onConfirm,
  onClose,
}: ReviewStatusModalProps) {
  const { t } = useTranslation();
  const hiding = review.status === 'visible';
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!reason.trim()) {
      setError(t('reviewAdmin.statusModal.required'));
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      title={t(hiding ? 'reviewAdmin.statusModal.hideTitle' : 'reviewAdmin.statusModal.showTitle')}
      description={t('reviewAdmin.statusModal.description')}
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={hiding ? 'danger' : 'primary'}
            icon={hiding ? 'visibility_off' : 'visibility'}
            loading={busy}
            onClick={submit}
          >
            {t(hiding ? 'reviewAdmin.actions.hide' : 'reviewAdmin.actions.show')}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-surface-container-low p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-title-md text-title-md text-on-surface">{review.author.name}</span>
          <RatingStars value={review.rating} />
        </div>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          {review.place.name}
        </p>
        {review.comment && (
          <p className="mt-2 line-clamp-4 font-body-md text-body-md whitespace-pre-line text-on-surface">
            {review.comment}
          </p>
        )}
      </div>
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('reviewAdmin.statusModal.reasonLabel')}
        <textarea
          rows={4}
          maxLength={MAX_REASON_LENGTH}
          value={reason}
          autoFocus
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          placeholder={t(
            hiding
              ? 'reviewAdmin.statusModal.hidePlaceholder'
              : 'reviewAdmin.statusModal.showPlaceholder',
          )}
          className={`w-full resize-none rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:outline-none ${
            error ? 'ring-2 ring-error' : 'focus:ring-primary'
          }`}
        />
      </label>
      <div className="mt-1 flex justify-between font-body-sm text-body-sm">
        <span className="text-error">{error}</span>
        <span className="text-outline">
          {reason.length}/{MAX_REASON_LENGTH}
        </span>
      </div>
    </Modal>
  );
}
