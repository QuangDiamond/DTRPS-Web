import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { AdminAccountDetails, AdminProfile, AdminSession } from '@/types';
import { formatDayTime } from '@/utils/format';

interface ProfileIdentityCardProps {
  admin: AdminProfile;
  details: AdminAccountDetails;
  currentSession?: AdminSession;
}

export default function ProfileIdentityCard({
  admin,
  details,
  currentSession,
}: ProfileIdentityCardProps) {
  const { t } = useTranslation();
  const contactRows = [
    { icon: 'mail', label: t('profile.profileIdentityCard.workEmail'), value: admin.email },
    { icon: 'call', label: t('profile.profileIdentityCard.directHotline'), value: details.hotline },
    {
      icon: 'corporate_fare',
      label: t('profile.profileIdentityCard.department'),
      value: details.department,
    },
  ];

  return (
    <div className="relative flex flex-col gap-space-md overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary-fixed/20 blur-2xl" />
      <div className="z-10 flex items-start gap-space-md">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary-container shadow-inner">
          <Icon name="shield_person" className="text-[44px] text-primary" />
          <span className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm">
            <Icon name="lock" className="text-[14px]" />
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-headline-sm text-headline-sm font-semibold text-on-surface">
            {admin.name} {admin.role}
          </span>
          <span className="mt-0.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary uppercase">
            ID: {details.id}
          </span>
          <p className="mt-1 font-body-sm text-body-sm leading-snug text-on-surface-variant">
            {details.jobTitle}
          </p>
        </div>
      </div>

      <div className="z-10 grid grid-cols-1 gap-2.5 pt-space-xs">
        {contactRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-space-sm rounded-xl bg-surface-container-low p-space-sm"
          >
            <Icon name={row.icon} className="text-[18px] text-primary" />
            <div className="flex min-w-0 flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {row.label}
              </span>
              <span className="font-body-md text-body-md leading-snug font-medium text-on-surface">
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {currentSession && (
        <div className="flex items-start gap-space-xs rounded-xl bg-surface-container-high/60 p-space-sm">
          <Icon name="devices" className="mt-0.5 shrink-0 text-[18px] text-primary" />
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface">
              {t('profile.profileIdentityCard.lastSign')}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              <Trans
                i18nKey="profile.profileIdentityCard.fromIp"
                values={{
                  signedInAt: formatDayTime(currentSession.signedInAt),
                  ip: currentSession.ip,
                  device: currentSession.device,
                }}
                components={{ c0: <span className="font-semibold text-on-surface" /> }}
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
