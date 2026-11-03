import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '@/components/common';
import { useToast } from '@/hooks';
import { adminUserService } from '@/services/adminUserService';
import type { AdminUser } from '@/types';
import { getErrorMessage } from '@/utils/error';

const MAX_REASON = 500;

/** Khóa (bắt buộc lý do) / mở khóa tài khoản; trả về hàm mở hộp thoại + phần tử hộp thoại */
export function useUserLock(onChanged: (user: AdminUser) => void): {
  lock: (user: AdminUser) => void;
  unlock: (user: AdminUser) => void;
  dialogs: ReactNode;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [target, setTarget] = useState<{ user: AdminUser; mode: 'lock' | 'unlock' } | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (busy) return;
    setTarget(null);
    setReason('');
    setError('');
  };

  const confirm = async () => {
    if (!target) return;
    if (target.mode === 'lock' && !reason.trim()) {
      setError(t('userAdmin.lock.required'));
      return;
    }
    setBusy(true);
    try {
      const updated = await adminUserService.setStatus(
        target.user.id,
        target.mode === 'lock' ? 'suspended' : 'active',
        target.mode === 'lock' ? reason : undefined,
      );
      showToast(
        t(target.mode === 'lock' ? 'userAdmin.toast.locked' : 'userAdmin.toast.unlocked', {
          name: updated.name,
        }),
      );
      onChanged(updated);
      setTarget(null);
      setReason('');
    } catch (actionError) {
      showToast(t('userAdmin.toast.failed', { message: getErrorMessage(actionError) }), 'error');
    } finally {
      setBusy(false);
    }
  };

  const dialogs = target ? (
    <Modal
      title={t(target.mode === 'lock' ? 'userAdmin.lock.title' : 'userAdmin.unlock.title')}
      description={t(
        target.mode === 'lock' ? 'userAdmin.lock.description' : 'userAdmin.unlock.description',
      )}
      onClose={close}
      footer={
        <>
          <Button variant="neutral" onClick={close} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button
            variant={target.mode === 'lock' ? 'danger' : 'primary'}
            icon={target.mode === 'lock' ? 'lock' : 'lock_open'}
            loading={busy}
            onClick={() => void confirm()}
          >
            {t(target.mode === 'lock' ? 'userAdmin.lock.confirm' : 'userAdmin.unlock.confirm')}
          </Button>
        </>
      }
    >
      <p className="mb-3 font-title-md text-title-md text-on-surface">
        {target.user.name} · {target.user.email}
      </p>
      {target.mode === 'lock' && (
        <>
          <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
            {t('userAdmin.lock.reasonLabel')}
            <textarea
              rows={3}
              maxLength={MAX_REASON}
              value={reason}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value);
                setError('');
              }}
              placeholder={t('userAdmin.lock.reasonPlaceholder')}
              className={`w-full resize-none rounded-xl bg-surface-container-low px-3 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:outline-none ${
                error ? 'ring-2 ring-error' : 'focus:ring-primary'
              }`}
            />
          </label>
          {error && <p className="mt-1 font-body-sm text-body-sm text-error">{error}</p>}
        </>
      )}
    </Modal>
  ) : null;

  return {
    lock: (user) => setTarget({ user, mode: 'lock' }),
    unlock: (user) => setTarget({ user, mode: 'unlock' }),
    dialogs,
  };
}
