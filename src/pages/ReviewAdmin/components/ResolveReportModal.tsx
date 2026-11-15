import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import type { ReportedReview } from '@/types';
import RatingStars from './RatingStars';

const MAX_REASON_LENGTH = 1000;

interface ResolveReportModalProps {
  item: ReportedReview;
  /** hide = ẩn đánh giá (lý do bắt buộc, gửi người viết); dismiss = bỏ qua (ghi chú nội bộ) */
  action: 'hide' | 'dismiss';
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Xử lý báo cáo một đánh giá — người báo cáo nhận kết quả trong cả hai trường hợp */
export default function ResolveReportModal({
  item,
  action,
  busy,
  onConfirm,
  onClose,
}: ResolveReportModalProps) {
  const { t } = useTranslation();
  const hiding = action === 'hide';
  // Gợi ý sẵn lý do bị báo cáo nhiều nhất khi ẩn
  const [reason, setReason] = useState(() =>
    hiding && item.reasons[0] ? t(`reviewAdmin.reasons.${item.reasons[0].reason}`) : '',
  );
  const [error, setError] = useState('');

  const submit = () => {
    if (hiding && !reason.trim()) {
      setError(t('reviewAdmin.statusModal.required'));
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      title={t(hiding ? 'reviewAdmin.reports.hideTitle' : 'reviewAdmin.reports.dismissTitle')}
      description={t(
        hiding ? 'reviewAdmin.reports.hideDescription' : 'reviewAdmin.reports.dismissDescription',
        { count: item.reportCount },
      )}
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={hiding ? 'danger' : 'primary'}
            icon={hiding ? 'visibility_off' : 'task_alt'}
            loading={busy}
            onClick={submit}
          >
            {t(hiding ? 'reviewAdmin.reports.hide' : 'reviewAdmin.reports.dismiss')}
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-xl bg-surface-container-low p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-title-md text-title-md text-on-surface">
            {item.review.author.name}
          </span>
          <RatingStars value={item.review.rating} />
        </div>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          {item.review.place.name}
        </p>
        {item.review.comment && (
          <p className="mt-2 line-clamp-4 font-body-md text-body-md whitespace-pre-line text-on-surface">
            {item.review.comment}
          </p>
        )}
      </div>
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t(hiding ? 'reviewAdmin.reports.hideReasonLabel' : 'reviewAdmin.reports.dismissNoteLabel')}
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
              : 'reviewAdmin.reports.dismissPlaceholder',
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
