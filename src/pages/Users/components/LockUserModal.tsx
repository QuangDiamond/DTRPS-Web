import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import { USER_LOCK_REASONS } from '@/constants/user';
import type { AppUser } from '@/types';

interface LockUserModalProps {
  /** Các tài khoản sẽ bị khóa (1 hoặc nhiều) */
  targets: AppUser[];
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function LockUserModal({ targets, onConfirm, onClose }: LockUserModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<(typeof USER_LOCK_REASONS)[number]>(USER_LOCK_REASONS[0]);
  const [note, setNote] = useState('');
  const single = targets.length === 1 ? targets[0] : null;

  return (
    <Modal
      title={
        single
          ? t('users.lockUserModal.lockUserAccount')
          : t('users.lockUserModal.lockAccounts', { count: targets.length })
      }
      description={
        single
          ? t('users.lockUserModal.willNotAbleSign', { name: single.name, id: single.id })
          : t('users.lockUserModal.theSelectedAccountsWill')
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('users.lockUserModal.cancel')}
          </Button>
          <button
            type="button"
            onClick={() => onConfirm(note.trim() ? `${t(reason)} — ${note.trim()}` : t(reason))}
            className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-all hover:bg-on-error-container"
          >
            <Icon name="lock" className="text-[18px]" /> {t('users.lockUserModal.confirmLock')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {!single && (
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {targets.map((user) => (
              <span
                key={user.id}
                className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface"
              >
                {user.name}
              </span>
            ))}
          </div>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('users.lockUserModal.reasonLockingAccount')}
          </span>
          <select
            value={reason}
            onChange={(event) => {
              const next = USER_LOCK_REASONS.find((item) => item === event.target.value);
              if (next) setReason(next);
            }}
            className="h-10 w-full cursor-pointer rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-error focus:outline-none"
          >
            {USER_LOCK_REASONS.map((item) => (
              <option key={item} value={item}>
                {t(item)}
              </option>
            ))}
          </select>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('users.lockUserModal.additionalNotesCustomerSupport')}
          className="w-full resize-none rounded-xl bg-surface-container-low p-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-error focus:outline-none"
        />
      </div>
    </Modal>
  );
}
