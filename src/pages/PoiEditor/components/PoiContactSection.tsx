import { useTranslation } from 'react-i18next';
import type { PoiFieldChange, PoiFormErrors } from '@/pages/PoiEditor/poiFormUtils';
import type { PoiFormValues } from '@/types';
import PoiSectionCard from './PoiSectionCard';
import PoiTextField from './PoiTextField';

interface PoiContactSectionProps {
  values: PoiFormValues;
  errors: PoiFormErrors;
  onChange: PoiFieldChange;
}

export default function PoiContactSection({ values, errors, onChange }: PoiContactSectionProps) {
  const { t } = useTranslation();
  return (
    <PoiSectionCard
      icon="apartment"
      title={t('poiEditor.poiContactSection.n3ContactInformationManaging')}
      description={t('poiEditor.poiContactSection.siteManagementOrganizationTraveler')}
    >
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <PoiTextField
          className="md:col-span-2"
          label={t('poiEditor.poiContactSection.officialManagingOrganization')}
          value={values.managingUnit}
          onChange={(managingUnit) => onChange('managingUnit', managingUnit)}
        />
        <PoiTextField
          label={t('poiEditor.poiContactSection.rescueSupportHotline')}
          icon="call"
          type="tel"
          value={values.hotline}
          error={errors.hotline}
          onChange={(hotline) => onChange('hotline', hotline)}
        />
        <PoiTextField
          label={t('poiEditor.poiContactSection.officialWebsite')}
          icon="language"
          type="url"
          value={values.website}
          placeholder="https://"
          error={errors.website}
          onChange={(website) => onChange('website', website)}
        />
        <PoiTextField
          className="md:col-span-2"
          label={t('poiEditor.poiContactSection.feedbackEmail')}
          icon="mail"
          type="email"
          value={values.email}
          error={errors.email}
          onChange={(email) => onChange('email', email)}
        />
      </div>
    </PoiSectionCard>
  );
}
