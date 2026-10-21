import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Modal } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { securityScore, securityTier } from '@/pages/Profile/profileUtils';
import type { SecurityCheckItem } from '@/types';

const SCAN_DURATION_MS = 1200;

interface SecurityCheckModalProps {
  checks: SecurityCheckItem[];
  onClose: () => void;
}

/** Mô phỏng quét bảo mật rồi hiển thị kết quả từng hạng mục */
export default function SecurityCheckModal({ checks, onClose }: SecurityCheckModalProps) {
  const { t } = useTranslation();
  const [scanning, setScanning] = useState(true);
  const score = securityScore(checks);
  const failed = checks.filter((check) => !check.passed).length;

  useEffect(() => {
    const timer = window.setTimeout(() => setScanning(false), SCAN_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Modal
      title={t('profile.securityCheckModal.systemSecurityCheck')}
      description={t('profile.securityCheckModal.reviewAuthenticationSettingsSign')}
      onClose={onClose}
      footer={
        !scanning && failed > 0 ? (
          <Link
            to={ROUTES.SETTINGS}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
          >
            <Icon name="settings" className="text-[18px]" />{' '}
            {t('profile.securityCheckModal.openSecuritySettings')}
          </Link>
        ) : undefined
      }
    >
      {scanning ? (
        <div className="flex flex-col items-center gap-space-sm py-space-xl text-center">
          <Icon name="radar" className="animate-spin text-[44px] text-primary" />
          <span className="font-title-md text-title-md text-on-surface">
            {t('profile.securityCheckModal.scanningSecurityConfiguration')}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('profile.securityCheckModal.checkingItemsAgainstSoc2', { length: checks.length })}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          <div
            className={`flex items-center justify-between rounded-xl p-space-md ${
              failed === 0 ? 'bg-primary-fixed/40' : 'bg-tertiary-fixed/60'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t('profile.securityCheckModal.safetyScore')}
              </span>
              <span className="font-display-sm text-display-sm font-bold text-on-surface">
                {score}%
              </span>
            </div>
            <span className="max-w-[60%] text-right font-label-md text-label-md text-on-surface">
              {failed === 0
                ? t('profile.securityCheckModal.noRisksDetected')
                : t('profile.securityCheckModal.itemsNeedAttention', { count: failed })}
              <span className="block font-body-sm text-body-sm text-on-surface-variant">
                {securityTier(score)}
              </span>
            </span>
          </div>
          <ul className="flex flex-col gap-space-xs">
            {checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-sm"
              >
                <Icon
                  name={check.passed ? 'check_circle' : 'error'}
                  filled
                  className={`mt-0.5 text-[20px] ${check.passed ? 'text-primary' : 'text-error'}`}
                />
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">{check.label}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {check.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
