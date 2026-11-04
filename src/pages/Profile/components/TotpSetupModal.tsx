import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import OtpInput from '@/components/auth/OtpInput';
import { Button, Icon, Modal } from '@/components/common';
import { OTP_LENGTH } from '@/constants/auth';
import { useResource, useToast } from '@/hooks';
import { profileService } from '@/services/profileService';
import { copyText } from '@/utils/clipboard';
import { getErrorMessage } from '@/utils/error';

const QR_SIZE = 21;

/** Ô QR minh họa (sinh giả từ secret) — khi có backend thay bằng ảnh QR otpauth:// thật */
function buildQrCells(seed: string): boolean[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const isFinder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    const ring = (ox: number, oy: number) => {
      const dx = x - ox;
      const dy = y - oy;
      return (
        dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
      );
    };
    if (inBox(0, 0)) return { inside: true, on: ring(0, 0) };
    if (inBox(QR_SIZE - 7, 0)) return { inside: true, on: ring(QR_SIZE - 7, 0) };
    if (inBox(0, QR_SIZE - 7)) return { inside: true, on: ring(0, QR_SIZE - 7) };
    return { inside: false, on: false };
  };
  return Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
    const x = index % QR_SIZE;
    const y = Math.floor(index / QR_SIZE);
    const finder = isFinder(x, y);
    if (finder.inside) return finder.on;
    state = (state * 1103515245 + 12345) >>> 0;
    return (state >>> 16) % 2 === 0;
  });
}

interface TotpSetupModalProps {
  accountEmail: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function TotpSetupModal({ accountEmail, onConfirm, onClose }: TotpSetupModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LENGTH }, () => ''),
  );
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const setup = useResource(profileService.startTotpSetup);
  const secret = setup.data?.secret ?? '';
  const cells = useMemo(() => buildQrCells(secret + accountEmail), [secret, accountEmail]);
  const code = digits.join('');

  const copySecret = async () => {
    if (!secret) return;
    const copied = await copyText(secret.replace(/\s/g, ''));
    showToast(
      copied
        ? t('profile.totpSetupModal.secretKeyCopied')
        : t('profile.totpSetupModal.couldNotCopyPlease'),
      copied ? 'info' : 'error',
    );
  };

  const verify = async () => {
    if (code.length < OTP_LENGTH) {
      setError(t('profile.totpSetupModal.pleaseEnterAllDigits', { OTP_LENGTH }));
      return;
    }
    setVerifying(true);
    try {
      const { valid } = await profileService.verifyTotp(code);
      if (valid) {
        onConfirm();
        return;
      }
      setError(t('profile.totpSetupModal.theCodeIncorrectOr'));
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Modal
      title={t('profile.totpSetupModal.reconfigureGoogleAuthenticator')}
      description={t('profile.totpSetupModal.scanQrCodeWith')}
      onClose={onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon="verified" loading={verifying} disabled={!secret} onClick={verify}>
            {t('profile.totpSetupModal.confirmLink')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-space-md">
        <svg
          viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
          className="h-40 w-40 rounded-xl bg-surface-container-lowest p-2 shadow-sm ring-1 ring-surface-container-high"
          role="img"
          aria-label={t('profile.totpSetupModal.qrCodeLinkAuthenticator')}
          shapeRendering="crispEdges"
        >
          {cells.map((on, index) =>
            on ? (
              <rect
                key={index}
                x={index % QR_SIZE}
                y={Math.floor(index / QR_SIZE)}
                width="1"
                height="1"
                className="fill-on-surface"
              />
            ) : null,
          )}
        </svg>
        <div className="flex w-full items-center justify-between gap-space-sm rounded-xl bg-surface-container-low px-space-md py-2">
          <div className="flex min-w-0 flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('profile.totpSetupModal.orEnterSecretKey')}
            </span>
            <span className="truncate font-mono text-body-sm font-semibold text-on-surface">
              {secret ||
                (setup.status === 'error'
                  ? t('profile.totpSetupModal.couldNotCreateKey')
                  : t('profile.totpSetupModal.creatingKey'))}
            </span>
          </div>
          <button
            type="button"
            title={t('profile.totpSetupModal.copyKey')}
            onClick={copySecret}
            className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-surface-container-high"
          >
            <Icon name="content_copy" className="text-[18px]" />
          </button>
        </div>
        <div className="flex w-full flex-col items-center gap-space-xs">
          <OtpInput
            digits={digits}
            onChange={(next) => {
              setDigits(next);
              setError('');
            }}
          />
          {error ? (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
              <Icon name="error" className="text-[14px]" /> {error}
            </span>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
