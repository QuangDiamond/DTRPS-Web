import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Icon } from '@/components/common';
import type { AdminAccountDetails, AdminSession, SecurityKey } from '@/types';
import { formatDate, toIsoDate } from '@/utils/format';
import ProfileCardHeader, { PROFILE_CARD_CLASS } from './ProfileCardHeader';
import SessionHistoryTable from './SessionHistoryTable';

interface TwoFactorCardProps {
  details: AdminAccountDetails;
  securityKeys: SecurityKey[];
  sessions: AdminSession[];
  onReconfigureTotp: () => void;
  onShowBackupCodes: () => void;
  onAddKey: () => void;
  onRevokeOthers: () => void;
}

const SMALL_BUTTON_CLASS =
  'rounded-full px-space-md py-1.5 font-label-sm text-label-sm font-semibold transition-colors hover:bg-surface-container';

interface MethodBoxProps {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
  description: string;
  actions: ReactNode;
}

function MethodBox({ icon, title, subtitle, status, description, actions }: MethodBoxProps) {
  return (
    <div className="flex flex-col justify-between gap-space-md rounded-2xl bg-surface-container-low p-space-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-xs">
            <Icon name={icon} className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {title}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-container">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {status}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}

export default function TwoFactorCard({
  details,
  securityKeys,
  sessions,
  onReconfigureTotp,
  onShowBackupCodes,
  onAddKey,
  onRevokeOthers,
}: TwoFactorCardProps) {
  const { t } = useTranslation();
  const primaryKey = securityKeys[0];

  return (
    <div className={PROFILE_CARD_CLASS}>
      <ProfileCardHeader
        icon="security_update_good"
        title={t('profile.twoFactorCard.twoFactorSecurityAuthentication')}
        description={t('profile.twoFactorCard.multiFactorAuthenticationMethods')}
      />
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <MethodBox
          icon="phone_android"
          title="Google Authenticator / 2FA"
          subtitle={t('profile.twoFactorCard.totpAuthenticationCode')}
          status={t('profile.twoFactorCard.on')}
          description={t('profile.twoFactorCard.theAuthenticatorAppGenerating', {
            value: formatDate(toIsoDate(new Date(details.totpEnabledAt))),
          })}
          actions={
            <>
              <button
                type="button"
                onClick={onReconfigureTotp}
                className={`${SMALL_BUTTON_CLASS} bg-surface-container-lowest text-primary`}
              >
                {t('profile.twoFactorCard.reconfigure')}
              </button>
              <button
                type="button"
                onClick={onShowBackupCodes}
                className={`${SMALL_BUTTON_CLASS} text-on-surface-variant`}
              >
                {t('profile.twoFactorCard.backupCodes', { length: details.backupCodes.length })}
              </button>
            </>
          }
        />
        <MethodBox
          icon="usb"
          title={t('profile.twoFactorCard.fido2HardwareKey')}
          subtitle={primaryKey?.name ?? t('profile.twoFactorCard.notLinked')}
          status={t('profile.twoFactorCard.linked', { length: securityKeys.length })}
          description={
            primaryKey
              ? securityKeys.length > 1
                ? t('profile.twoFactorCard.serialPlugKeyInto', {
                    serial: primaryKey.serial,
                    count: securityKeys.length - 1,
                  })
                : t('profile.twoFactorCard.serialPlugKeyInto2', { serial: primaryKey.serial })
              : t('profile.twoFactorCard.linkFido2KeyApprove')
          }
          actions={
            <button
              type="button"
              onClick={onAddKey}
              className={`${SMALL_BUTTON_CLASS} bg-surface-container-lowest text-primary`}
            >
              {t('profile.twoFactorCard.addBackupKey')}
            </button>
          }
        />
      </div>
      <SessionHistoryTable sessions={sessions} onRevokeOthers={onRevokeOthers} />
    </div>
  );
}
