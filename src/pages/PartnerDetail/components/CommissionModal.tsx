import { useState } from 'react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

interface CommissionModalProps {
  current: number;
  onConfirm: (commission: number) => void;
  onClose: () => void;
}

const MIN_COMMISSION = 0;
const MAX_COMMISSION = 30;

export default function CommissionModal({ current, onConfirm, onClose }: CommissionModalProps) {
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
      title="Điều chỉnh mức hoa hồng"
      description={`Mức hiện tại: ${current}% — áp dụng cho các giao dịch phát sinh sau khi lưu`}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            Hủy
          </Button>
          <Button icon="save" disabled={!changed} onClick={() => onConfirm(parsed)}>
            Lưu mức mới
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
          Mức hoa hồng hệ thống (%)
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
            Mức hoa hồng phải trong khoảng {MIN_COMMISSION}–{MAX_COMMISSION}%
          </span>
        )}
      </label>
    </Modal>
  );
}
