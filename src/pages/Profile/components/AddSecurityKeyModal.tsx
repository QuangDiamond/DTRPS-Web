import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Button, Icon, Modal } from '@/components/common';
import { MAX_SECURITY_KEYS } from '@/constants/adminProfile';

const TOUCH_WAIT_MS = 1800;

interface AddSecurityKeyModalProps {
  keyCount: number;
  onAdd: (name: string) => void;
  onClose: () => void;
}

/** Mô phỏng quy trình liên kết khóa FIDO2 (WebAuthn) — khi có backend dùng navigator.credentials.create */
export default function AddSecurityKeyModal({
  keyCount,
  onAdd,
  onClose,
}: AddSecurityKeyModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(t('profile.addSecurityKeyModal.backupYubikey', { keyCount }));
  const [waiting, setWaiting] = useState(false);
  const deviceName = name.trim() || t('profile.addSecurityKeyModal.backupFido2Key');
  const isFull = keyCount >= MAX_SECURITY_KEYS;

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => onAdd(deviceName), TOUCH_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [waiting, deviceName, onAdd]);

  return (
    <Modal
      title={t('profile.addSecurityKeyModal.addBackupSecurityKey')}
      description={t('profile.addSecurityKeyModal.plugFido2KeyVia')}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="usb" disabled={waiting || isFull} onClick={() => setWaiting(true)}>
            {t('profile.addSecurityKeyModal.startLinking')}
          </Button>
        </>
      }
    >
      {waiting ? (
        <div className="flex flex-col items-center gap-space-sm py-space-lg text-center">
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Icon name="fingerprint" className="text-[44px] text-primary" />
          </span>
          <span className="font-title-md text-title-md text-on-surface">
            {t('profile.addSecurityKeyModal.touchYourSecurityKey')}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('profile.addSecurityKeyModal.waitingConfirmationFrom', { deviceName })}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('profile.addSecurityKeyModal.keyNickname')}
          </label>
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl bg-surface-container-low px-space-md font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          {isFull ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
              <Icon name="error" className="text-[14px]" />{' '}
              {t('profile.addSecurityKeyModal.reachedLimitKeysPer', { MAX_SECURITY_KEYS })}
            </span>
          ) : (
            <span className="font-body-sm text-body-sm text-outline">
              {t('profile.addSecurityKeyModal.keysLinkedKeepAt', { keyCount, MAX_SECURITY_KEYS })}
            </span>
          )}
        </div>
      )}
    </Modal>
  );
}
