import { useTranslation } from 'react-i18next';
import { LISTING_SLA_OPTIONS } from '@/constants/settings';
import type { SettingsFieldChange } from '@/pages/Settings/settingsUtils';
import type { SystemSettings } from '@/types';
import SettingsCard from './SettingsCard';
import SettingToggleRow from './SettingToggleRow';

interface ListingSlaCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
}

const STANDARD_SLA = 24;

export default function ListingSlaCard({ values, onChange }: ListingSlaCardProps) {
  const { t } = useTranslation();
  return (
    <SettingsCard
      icon="assignment_turned_in"
      title={t('settings.listingSlaCard.listingReviewStandardsSla')}
      description={t('settings.listingSlaCard.tourismServiceQualityRequirements')}
      aside={
        <span className="shrink-0 rounded-full bg-tertiary-fixed px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary-fixed">
          {values.listingSlaHours === STANDARD_SLA
            ? t('settings.listingSlaCard.strictSla')
            : `SLA ${values.listingSlaHours}h`}
        </span>
      }
    >
      <div className="space-y-2">
        <span className="block font-label-md text-label-md text-on-surface-variant">
          {t('settings.listingSlaCard.committedPartnerReviewTime')}
        </span>
        <div className="grid grid-cols-3 gap-space-sm">
          {LISTING_SLA_OPTIONS.map((hours) => {
            const selected = values.listingSlaHours === hours;
            return (
              <label
                key={hours}
                className={`flex cursor-pointer flex-wrap items-center justify-center gap-2 rounded-xl p-space-md font-label-md text-label-md transition-all ${
                  selected
                    ? 'bg-secondary-fixed/40 text-on-secondary-fixed-variant shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <input
                  type="radio"
                  name="sla_time"
                  value={hours}
                  checked={selected}
                  onChange={() => onChange('listingSlaHours', hours)}
                  className="h-4 w-4 accent-primary"
                />
                <span className={selected ? 'font-bold' : ''}>
                  {t('settings.listingSlaCard.hours', { hours })}
                </span>
                {hours === STANDARD_SLA && (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] text-on-primary">
                    {t('settings.listingSlaCard.standard')}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-space-sm pt-2">
        <SettingToggleRow
          icon="policy"
          title={t('settings.listingSlaCard.requireBusinessLicenseFire')}
          description={t('settings.listingSlaCard.automaticallyRejectWhenAccommodation')}
          checked={values.requireLegalDocs}
          onChange={(checked) => onChange('requireLegalDocs', checked)}
        />
        <SettingToggleRow
          icon="pin_drop"
          title={t('settings.listingSlaCard.checkDuplicateGpsCoordinates')}
          description={t('settings.listingSlaCard.enableAiGeofencingFlag')}
          checked={values.gpsDuplicateCheck}
          onChange={(checked) => onChange('gpsDuplicateCheck', checked)}
        />
        <SettingToggleRow
          icon="forward_to_inbox"
          title={t('settings.listingSlaCard.automaticallyEmailResultPartner')}
          description={t('settings.listingSlaCard.includeDetailedChecklistWhen')}
          checked={values.autoEmailPartnerResult}
          onChange={(checked) => onChange('autoEmailPartnerResult', checked)}
        />
      </div>
    </SettingsCard>
  );
}
