import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { PARTNER_LOCK_OTHER_REASON, PARTNER_LOCK_REASONS } from '@/constants/partner';
import type { Partner } from '@/types';

interface LockPartnerModalProps {
  partner: Partner;
  /** Số địa điểm đang hiển thị sẽ bị tạm ẩn theo */
  affectedListings: number;
  onConfirm: (reason: string, note: string) => void;
  onClose: () => void;
}

/** Modal "Xác nhận tạm khóa tài khoản đối tác?" */
export default function LockPartnerModal({
  partner,
  affectedListings,
  onConfirm,
  onClose,
}: LockPartnerModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<(typeof PARTNER_LOCK_REASONS)[number]>(
    PARTNER_LOCK_REASONS[0],
  );
  const [note, setNote] = useState('');
  const needsNote = reason === PARTNER_LOCK_OTHER_REASON;
  const canConfirm = !needsNote || note.trim().length > 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_0.2s_ease-out] items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('components.lockPartnerModal.confirmPartnerAccountSuspension')}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <Icon name="warning" className="text-[26px]" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              {t('components.lockPartnerModal.suspendThisPartnerAccount')}
            </h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <Trans
                i18nKey="components.lockPartnerModal.thisWillPauseVisibility"
                values={{ name: partner.name, id: partner.id }}
                components={{ c0: <strong /> }}
              />
              {affectedListings > 0 ? (
                <>
                  {' '}
                  <Trans
                    i18nKey="components.lockPartnerModal.andItsRelatedListed"
                    values={{ affectedListings }}
                    components={{ c0: <strong /> }}
                  />
                </>
              ) : null}{' '}
              {t('components.lockPartnerModal.onSmartTravelVietnam')}
            </p>
          </div>
        </div>

        <div className="mb-5 space-y-2 rounded-xl bg-surface-container-low p-4">
          <label
            htmlFor="lock-reason"
            className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase"
          >
            {t('components.lockPartnerModal.reasonLockingAccount')}
          </label>
          <select
            id="lock-reason"
            value={reason}
            onChange={(event) => {
              const next = PARTNER_LOCK_REASONS.find((item) => item === event.target.value);
              if (next) setReason(next);
            }}
            className="h-10 w-full cursor-pointer rounded-lg bg-surface-container-lowest px-3 font-body-sm text-body-sm text-on-surface shadow-sm focus:ring-2 focus:ring-error focus:outline-none"
          >
            {PARTNER_LOCK_REASONS.map((item) => (
              <option key={item} value={item}>
                {t(item)}
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              needsNote
                ? t('components.lockPartnerModal.aDetailedNoteRequired')
                : t('components.lockPartnerModal.additionalNotesCustomerSupport')
            }
            className="w-full rounded-lg bg-surface-container-lowest p-2.5 font-body-sm text-body-sm text-on-surface shadow-sm placeholder:text-outline focus:ring-2 focus:ring-error focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container px-5 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            {t('components.lockPartnerModal.cancel')}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm(needsNote ? note.trim() : t(reason), needsNote ? '' : note.trim())
            }
            className="flex items-center gap-2 rounded-full bg-error px-6 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-md transition-all hover:bg-on-error-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="lock" className="text-[18px]" />
            <span>{t('components.lockPartnerModal.confirmLock')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
