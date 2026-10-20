import type { ReactNode } from 'react';
import type { Blocker } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';

interface UnsavedChangesDialogProps {
  blocker: Blocker;
  title?: string;
  children: ReactNode;
}

/** Hộp thoại xác nhận rời trang khi còn thay đổi chưa lưu (đi kèm useUnsavedChangesGuard) */
export default function UnsavedChangesDialog({
  blocker,
  title = 'Rời trang khi chưa lưu?',
  children,
}: UnsavedChangesDialogProps) {
  if (blocker.state !== 'blocked') return null;
  return (
    <ConfirmModal
      title={title}
      confirmLabel="Rời trang"
      confirmIcon="logout"
      onConfirm={() => blocker.proceed()}
      onClose={() => blocker.reset()}
    >
      {children}
    </ConfirmModal>
  );
}
