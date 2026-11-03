import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import type { Partner } from '@/types';

const MAX_REASON_LENGTH = 1000;

interface RejectPartnerModalProps {
  partner: Partner;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Từ chối hồ sơ đối tác — lý do bắt buộc, hiển thị cho đối tác để sửa và gửi lại */
export default function RejectPartnerModal({
  partner,
  busy,
  onConfirm,
  onClose,
}: RejectPartnerModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!reason.trim()) {
      setError(t('partnerAdmin.reject.required'));
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal
      title={t('partnerAdmin.reject.title')}
      description={t('partnerAdmin.reject.description')}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button variant="danger" icon="block" loading={busy} onClick={submit}>
            {t('partnerAdmin.reject.confirm')}
          </Button>
        </>
      }
    >
      <p className="mb-3 font-title-md text-title-md text-on-surface">{partner.name}</p>
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('partnerAdmin.reject.reasonLabel')}
        <textarea
          rows={4}
          maxLength={MAX_REASON_LENGTH}
          value={reason}
          autoFocus
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          placeholder={t('partnerAdmin.reject.placeholder')}
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
