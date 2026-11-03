import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import { REJECT_CODE_KEY, REJECT_CODES } from '@/pages/PlaceReview/placeReviewUtils';
import type { RevisionRejectCode } from '@/types';

const TEXTAREA_CLASS =
  'w-full resize-none rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:outline-none';

interface BaseProps {
  name: string;
  busy: boolean;
  onClose: () => void;
}

/** Duyệt địa điểm mới hoặc áp dụng bản sửa (bản sửa có thêm ghi chú nội bộ) */
export function ApproveDialog({
  kind,
  name,
  busy,
  onConfirm,
  onClose,
}: BaseProps & { kind: 'listing' | 'revision'; onConfirm: (note: string) => void }) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  const isRevision = kind === 'revision';
  return (
    <Modal
      title={t(
        isRevision ? 'placeReview.approve.revisionTitle' : 'placeReview.approve.listingTitle',
      )}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button icon="verified" loading={busy} onClick={() => onConfirm(note)}>
            {t(
              isRevision
                ? 'placeReview.actions.approveRevision'
                : 'placeReview.actions.approveListing',
            )}
          </Button>
        </>
      }
    >
      <p className="font-body-md text-body-md text-on-surface-variant">
        <Trans
          i18nKey={
            isRevision
              ? 'placeReview.approve.revisionMessage'
              : 'placeReview.approve.listingMessage'
          }
          values={{ name }}
          components={{ c0: <strong className="text-on-surface" /> }}
        />
      </p>
      {isRevision && (
        <label className="mt-4 flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
          {t('placeReview.approve.noteLabel')}
          <textarea
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('placeReview.approve.notePlaceholder')}
            className={`${TEXTAREA_CLASS} focus:ring-primary`}
          />
        </label>
      )}
    </Modal>
  );
}

/** Từ chối địa điểm mới — lý do hiển thị cho đối tác */
export function RejectListingDialog({
  name,
  busy,
  onConfirm,
  onClose,
}: BaseProps & { onConfirm: (reason: string) => void }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  return (
    <Modal
      title={t('placeReview.rejectListing.title')}
      description={t('placeReview.rejectListing.description')}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant="danger"
            icon="block"
            loading={busy}
            onClick={() =>
              reason.trim()
                ? onConfirm(reason.trim())
                : setError(t('placeReview.rejectListing.required'))
            }
          >
            {t('placeReview.rejectListing.confirm')}
          </Button>
        </>
      }
    >
      <p className="mb-3 font-title-md text-title-md text-on-surface">{name}</p>
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('placeReview.rejectListing.reasonLabel')}
        <textarea
          rows={4}
          maxLength={1000}
          autoFocus
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          placeholder={t('placeReview.rejectListing.placeholder')}
          className={`${TEXTAREA_CLASS} ${error ? 'ring-2 ring-error' : 'focus:ring-primary'}`}
        />
      </label>
      {error && <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>}
    </Modal>
  );
}

/** Từ chối bản sửa — nhóm lý do + góp ý cho đối tác + ghi chú nội bộ */
export function RejectRevisionDialog({
  name,
  busy,
  onConfirm,
  onClose,
}: BaseProps & {
  onConfirm: (code: RevisionRejectCode, feedback: string, note: string) => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState<RevisionRejectCode>('other');
  const [feedback, setFeedback] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [noteError, setNoteError] = useState('');

  // Theo yêu cầu: từ chối bản sửa bắt buộc có góp ý cho đối tác và ghi chú duyệt (review_note)
  const confirm = () => {
    const feedbackMissing = !feedback.trim();
    const noteMissing = !note.trim();
    setError(feedbackMissing ? t('placeReview.rejectRevision.feedbackRequired') : '');
    setNoteError(noteMissing ? t('placeReview.rejectRevision.noteRequired') : '');
    if (!feedbackMissing && !noteMissing) onConfirm(code, feedback.trim(), note.trim());
  };

  return (
    <Modal
      title={t('placeReview.rejectRevision.title')}
      description={t('placeReview.rejectRevision.description')}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button variant="danger" icon="block" loading={busy} onClick={confirm}>
            {t('placeReview.rejectRevision.confirm')}
          </Button>
        </>
      }
    >
      <p className="mb-3 font-title-md text-title-md text-on-surface">{name}</p>
      <p className="mb-2 font-label-md text-label-md text-on-surface">
        {t('placeReview.rejectRevision.codeLabel')}
      </p>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {REJECT_CODES.map((item) => (
          <label
            key={item}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 font-body-md text-body-md transition-colors ${
              code === item
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
            }`}
          >
            <input
              type="radio"
              name="reject-code"
              checked={code === item}
              onChange={() => setCode(item)}
              className="accent-error"
            />
            {t(REJECT_CODE_KEY[item])}
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('placeReview.rejectRevision.feedbackLabel')}
        <textarea
          rows={4}
          maxLength={2000}
          value={feedback}
          onChange={(event) => {
            setFeedback(event.target.value);
            setError('');
          }}
          placeholder={t('placeReview.rejectRevision.feedbackPlaceholder')}
          className={`${TEXTAREA_CLASS} ${error ? 'ring-2 ring-error' : 'focus:ring-primary'}`}
        />
      </label>
      {error && <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>}
      <label className="mt-4 flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('placeReview.rejectRevision.noteLabel')}
        <textarea
          rows={2}
          maxLength={1000}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setNoteError('');
          }}
          placeholder={t('placeReview.rejectRevision.notePlaceholder')}
          className={`${TEXTAREA_CLASS} ${noteError ? 'ring-2 ring-error' : 'focus:ring-primary'}`}
        />
      </label>
      {noteError && <p className="mt-1 font-body-sm text-body-sm text-error">{noteError}</p>}
    </Modal>
  );
}
