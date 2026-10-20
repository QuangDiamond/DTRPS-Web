import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import { todayIsoDate } from '../../../utils/format';

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
  const today = todayIsoDate();
  const [date, setDate] = useState(currentDate < today ? today : currentDate);
  const isValid = date >= today;

  return (
    <Modal
      title="Lên lịch tái thẩm định"
      description="Chọn ngày kiểm định chất lượng dịch vụ kỳ tiếp theo"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-all hover:bg-surface-container-high"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => onConfirm(date)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="event_available" className="text-[18px]" /> Lưu lịch
          </button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
          Ngày tái thẩm định
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
