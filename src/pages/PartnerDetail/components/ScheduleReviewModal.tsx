import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import { todayIsoDate } from '@/utils/format';

interface ScheduleReviewModalProps {
  currentDate: string;
  onConfirm: (isoDate: string) => void;
  onClose: () => void;
}

export default function ScheduleReviewModal({
  currentDate,
  onConfirm,
  onClose,
}: ScheduleReviewModalProps) {
  const { t } = useTranslation();
  const today = todayIsoDate();
  const [date, setDate] = useState(currentDate < today ? today : currentDate);
  const isValid = date >= today;

  return (
    <Modal
      title={t('partnerDetail.scheduleReviewModal.scheduleReAssessment')}
      description={t('partnerDetail.scheduleReviewModal.pickDateNextService')}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="event_available" disabled={!isValid} onClick={() => onConfirm(date)}>
            {t('partnerDetail.scheduleReviewModal.saveSchedule')}
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {t('partnerDetail.scheduleReviewModal.reAssessmentDate')}
        </span>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </label>
    </Modal>
  );
}
