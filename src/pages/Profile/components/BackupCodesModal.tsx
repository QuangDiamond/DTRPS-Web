import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import { useToast } from '@/hooks';
import { copyText } from '@/utils/clipboard';
import { downloadTextFile } from '@/utils/download';
import { todayIsoDate } from '@/utils/format';

interface BackupCodesModalProps {
  codes: string[];
  accountEmail: string;
  onRegenerate: () => void;
  onClose: () => void;
}

export default function BackupCodesModal({
  codes,
  accountEmail,
  onRegenerate,
  onClose,
}: BackupCodesModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const content = [
    t('profile.backupCodesModal.smartTravelAdmin2fa'),
    t('profile.backupCodesModal.account', { accountEmail }),
    t('profile.backupCodesModal.created', { value: todayIsoDate() }),
    t('profile.backupCodesModal.eachCodeCanUsed'),
    '',
    ...codes,
  ].join('\n');

  const copyCodes = async () => {
    const copied = await copyText(codes.join('\n'));
    showToast(
      copied
        ? t('profile.backupCodesModal.backupCodesCopied')
        : t('profile.backupCodesModal.couldNotCopyPlease'),
      copied ? 'info' : 'error',
    );
  };

  return (
    <Modal
      title={t('profile.backupCodesModal.backupRecoveryCodes', { length: codes.length })}
      description={t('profile.backupCodesModal.useTheseIfYou')}
      onClose={onClose}
      footer={
        confirmRegenerate ? (
          <>
            <span className="mr-auto font-body-sm text-body-sm text-error">
              {t('profile.backupCodesModal.allOldCodesWill')}
            </span>
            <Button variant="neutral" onClick={() => setConfirmRegenerate(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              variant="danger"
              icon="autorenew"
              onClick={() => {
                onRegenerate();
                setConfirmRegenerate(false);
              }}
            >
              {t('profile.backupCodesModal.confirmRegeneration')}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              icon="autorenew"
              className="mr-auto text-error hover:bg-error-container/40 hover:text-error"
              onClick={() => setConfirmRegenerate(true)}
            >
              {t('profile.backupCodesModal.generateNewCodes')}
            </Button>
            <Button variant="neutral" icon="content_copy" onClick={copyCodes}>
              {t('profile.backupCodesModal.copy')}
            </Button>
            <Button
              icon="download"
              onClick={() => {
                downloadTextFile(`smarttravel-backup-codes-${todayIsoDate()}.txt`, content);
                showToast(t('profile.backupCodesModal.backupCodesFileDownloaded'), 'info');
              }}
            >
              {t('profile.backupCodesModal.downloadTxt')}
            </Button>
          </>
        )
      }
    >
      <div className="grid grid-cols-2 gap-space-sm">
        {codes.map((code, index) => (
          <div
            key={code}
            className="flex items-center gap-2 rounded-xl bg-surface-container-low px-space-md py-2.5"
          >
            <span className="font-label-sm text-label-sm text-outline">{index + 1}.</span>
            <span className="font-mono text-body-md font-semibold tracking-wider text-on-surface">
              {code}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
