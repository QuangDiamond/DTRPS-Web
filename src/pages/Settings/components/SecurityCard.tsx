import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { PLATFORM_INFO, SESSION_TIMEOUT_OPTIONS } from '@/constants/settings';
import type { SettingsFieldChange } from '@/pages/Settings/settingsUtils';
import type { SystemSettings } from '@/types';
import IpWhitelistField from './IpWhitelistField';
import SettingsCard from './SettingsCard';
import SettingToggleRow from './SettingToggleRow';

interface SecurityCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
  /** Tắt 2FA cần xác nhận ở trang cha */
  onRequestDisable2fa: () => void;
}

export default function SecurityCard({ values, onChange, onRequestDisable2fa }: SecurityCardProps) {
  const { t } = useTranslation();
  return (
    <SettingsCard
      icon="shield"
      title={t('settings.securityCard.adminPortalSecurity')}
      description={t('settings.securityCard.authenticationRulesAccessControl')}
      aside={
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary-container px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-container">
          <Icon name="lock" className="text-[14px]" />
          SOC2 Type II
        </span>
      }
    >
      <div className="space-y-space-md">
        <SettingToggleRow
          icon="password"
          title={t('settings.securityCard.twoFactorAuthentication2fa')}
          description={t('settings.securityCard.requiredAllSuperAdmins')}
          checked={values.twoFactorRequired}
          showStatus
          onChange={(checked) =>
            checked ? onChange('twoFactorRequired', true) : onRequestDisable2fa()
          }
        />

        <div>
          <span className="mb-1.5 block font-label-md text-label-md text-on-surface-variant">
            {t('settings.securityCard.autoSignOutAfter')}
          </span>
          <div className="grid grid-cols-3 gap-space-sm">
            {SESSION_TIMEOUT_OPTIONS.map((minutes) => {
              const selected = values.sessionTimeoutMinutes === minutes;
              return (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange('sessionTimeoutMinutes', minutes)}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl font-label-md text-label-md transition-colors ${
                    selected
                      ? 'bg-secondary-fixed/40 font-bold text-on-secondary-fixed-variant shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {selected && <Icon name="timer" className="text-[16px]" />}
                  <span>{t('settings.securityCard.minutes', { minutes })}</span>
                </button>
              );
            })}
          </div>
        </div>

        <IpWhitelistField
          entries={values.ipWhitelist}
          onChange={(entries) => onChange('ipWhitelist', entries)}
        />

        <div className="flex items-center justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md">
          <div className="flex items-center gap-space-sm">
            <Icon name="history_toggle_off" className="text-[20px] text-primary" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {t('settings.securityCard.securityAuditLog')}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {t('settings.securityCard.distributedTamperProofAutomatic')}
              </span>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-space-sm py-1 font-label-sm text-label-sm font-bold text-primary">
            <Icon name="check" className="text-[14px]" />
            {t('settings.securityCard.daysEnabled', {
              auditLogRetentionDays: PLATFORM_INFO.auditLogRetentionDays,
            })}
          </span>
        </div>
      </div>
    </SettingsCard>
  );
}
