import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import Button from './Button';
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
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon={confirmIcon} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="font-body-md text-body-md text-on-surface-variant">{children}</div>
    </Modal>
  );
}
