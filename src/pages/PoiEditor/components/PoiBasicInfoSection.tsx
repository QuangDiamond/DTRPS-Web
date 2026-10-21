import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { POI_CATEGORY_OPTIONS } from '@/constants/poi';
import type { PoiFieldChange, PoiFormErrors } from '@/pages/PoiEditor/poiFormUtils';
import type { PoiFormValues } from '@/types';
import PoiDescriptionEditor from './PoiDescriptionEditor';
import PoiSectionCard from './PoiSectionCard';
import PoiTextField, { POI_INPUT_CLASS } from './PoiTextField';

interface PoiBasicInfoSectionProps {
  values: PoiFormValues;
  errors: PoiFormErrors;
  onChange: PoiFieldChange;
}

export default function PoiBasicInfoSection({
  values,
  errors,
  onChange,
}: PoiBasicInfoSectionProps) {
  const { t } = useTranslation();
  return (
    <PoiSectionCard
      icon="info"
      title={t('poiEditor.poiBasicInfoSection.n1BasicPoiInformation')}
      description={t('poiEditor.poiBasicInfoSection.identityDataDisplayCategory')}
      badge={
        <span className="rounded-full bg-surface-container-low px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-primary">
          {t('poiEditor.poiBasicInfoSection.required')}
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <PoiTextField
          className="md:col-span-2"
          label={t('poiEditor.poiBasicInfoSection.poiDestinationName')}
          required
          value={values.name}
          placeholder={t('poiEditor.poiBasicInfoSection.eGPhoCo')}
          error={errors.name}
          onChange={(name) => onChange('name', name)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 font-label-md text-label-md font-semibold text-on-surface">
            <Trans
              i18nKey="poiEditor.poiBasicInfoSection.mainCategory"
              components={{ c0: <span className="text-error" /> }}
            />
          </label>
          <div className="relative">
            <select
              value={values.category}
              onChange={(event) => {
                const next = POI_CATEGORY_OPTIONS.find(
                  (option) => option.value === event.target.value,
                );
                if (next) onChange('category', next.value);
              }}
              className={`${POI_INPUT_CLASS} cursor-pointer appearance-none px-space-md`}
            >
              {POI_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="pointer-events-none absolute top-3 right-3 text-[20px] text-outline"
            />
          </div>
        </div>

        <PoiTextField
          label={t('poiEditor.poiBasicInfoSection.subCategoriesAiSuggestion')}
          value={values.tags}
          placeholder={t('poiEditor.poiBasicInfoSection.separateWithCommas')}
          onChange={(tags) => onChange('tags', tags)}
        />

        <PoiDescriptionEditor
          value={values.description}
          onChange={(description) => onChange('description', description)}
        />

        <PoiTextField
          label={t('poiEditor.poiBasicInfoSection.admissionPriceVnd')}
          icon="payments"
          value={values.price}
          placeholder={t('poiEditor.poiBasicInfoSection.eG120000')}
          onChange={(price) => onChange('price', price)}
        />
        <PoiTextField
          label={t('poiEditor.poiBasicInfoSection.openingHours')}
          icon="schedule"
          value={values.openingHours}
          placeholder={t('poiEditor.poiBasicInfoSection.eG0700')}
          onChange={(openingHours) => onChange('openingHours', openingHours)}
        />

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="flex items-center justify-between font-label-md text-label-md font-semibold text-on-surface">
            <span>{t('poiEditor.poiBasicInfoSection.suggestedVisitDuration')}</span>
          </label>
          <div className="flex items-center gap-space-md">
            <input
              type="text"
              value={values.suggestedDuration}
              placeholder={t('poiEditor.poiBasicInfoSection.eG34')}
              onChange={(event) => onChange('suggestedDuration', event.target.value)}
              className={`${POI_INPUT_CLASS} max-w-[240px] px-space-md placeholder:text-outline`}
            />
          </div>
        </div>
      </div>
    </PoiSectionCard>
  );
}
