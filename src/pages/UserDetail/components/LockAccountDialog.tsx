import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { USER_LOCK_REASONS } from '@/constants/user';
import type { AppUser } from '@/types';

interface LockAccountDialogProps {
  user: AppUser;
  /** Thiết bị đang đăng nhập, ví dụ "iPhone 15 Pro" */
  device: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Modal "Xác nhận khóa tài khoản người dùng" */
export default function LockAccountDialog({
  user,
  device,
  onConfirm,
  onClose,
}: LockAccountDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex animate-[fadeIn_0.2s_ease-out] items-center justify-center bg-inverse-surface/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('userDetail.lockAccountDialog.confirmUserAccountLock')}
        onClick={(event) => event.stopPropagation()}
        className="relative mx-space-md flex w-full max-w-lg flex-col gap-space-lg rounded-3xl bg-surface-container-lowest p-space-xl shadow-2xl"
      >
        <div className="flex items-start gap-space-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <Icon name="lock_person" className="text-[24px]" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {t('userDetail.lockAccountDialog.confirmUserAccountLock')}
            </h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              <Trans
                i18nKey="userDetail.lockAccountDialog.youAboutSuspendAccess"
                values={{ name: user.name, id: user.id }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="lock-user-reason"
            className="font-label-md text-label-md font-semibold text-on-surface"
          >
            <Trans
              i18nKey="userDetail.lockAccountDialog.reasonLockingAccount"
              components={{ c0: <span className="text-error" /> }}
            />
          </label>
          <textarea
            id="lock-user-reason"
            rows={3}
            autoFocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('userDetail.lockAccountDialog.enterDetailedReasonNotify')}
            className="w-full rounded-xl bg-surface-container-low p-space-md font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline focus:ring-2 focus:ring-error/20"
          />
          <div className="flex flex-wrap gap-1.5">
            {USER_LOCK_REASONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(t(item))}
                className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error"
              >
                {t(item)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-space-md font-label-sm text-label-sm text-on-surface-variant">
          <Icon name="info" className="text-[18px] text-error" />
          <span>{t('userDetail.lockAccountDialog.thisWillImmediatelyInvalidate', { device })}</span>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            {t('userDetail.lockAccountDialog.cancel')}
          </button>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onConfirm(trimmed)}
            className="rounded-full bg-error px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-error shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('userDetail.lockAccountDialog.lockNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
