import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Modal } from '@/components/common';

interface CommissionModalProps {
  current: number;
  onConfirm: (commission: number) => void;
  onClose: () => void;
}

const MIN_COMMISSION = 0;
const MAX_COMMISSION = 30;

export default function CommissionModal({ current, onConfirm, onClose }: CommissionModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(String(current));
  const parsed = Number(value);
  const isValid =
    value.trim() !== '' &&
    !Number.isNaN(parsed) &&
    parsed >= MIN_COMMISSION &&
    parsed <= MAX_COMMISSION;
  const changed = isValid && parsed !== current;

  return (
    <Modal
      title={t('partnerDetail.commissionModal.adjustCommissionRate')}
      description={t('partnerDetail.commissionModal.currentRateAppliesTransactions', { current })}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="save" disabled={!changed} onClick={() => onConfirm(parsed)}>
            {t('partnerDetail.commissionModal.saveNewRate')}
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {t('partnerDetail.commissionModal.platformCommissionRate')}
        </span>
        <input
          type="number"
          step={0.5}
          min={MIN_COMMISSION}
          max={MAX_COMMISSION}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
        />
        {!isValid && (
          <span className="font-body-sm text-body-sm text-error">
            {t('partnerDetail.commissionModal.theCommissionRateMust', {
              MIN_COMMISSION,
              MAX_COMMISSION,
            })}
          </span>
        )}
      </label>
    </Modal>
  );
}
