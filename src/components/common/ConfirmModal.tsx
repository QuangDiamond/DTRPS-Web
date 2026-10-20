import type { ReactNode } from 'react';
import Icon from './Icon';
import Modal from './Modal';

interface ConfirmModalProps {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmIcon?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Hộp thoại xác nhận trước các thao tác hàng loạt */
export default function ConfirmModal({
  title,
  children,
  confirmLabel,
  confirmIcon = 'check',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
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
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <Icon name={confirmIcon} className="text-[18px]" /> {confirmLabel}
          </button>
        </>
      }
    >
      <div className="font-body-md text-body-md text-on-surface-variant">{children}</div>
    </Modal>
  );
}
