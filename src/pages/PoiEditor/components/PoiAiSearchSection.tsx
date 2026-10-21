import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { PoiFieldChange } from '@/pages/PoiEditor/poiFormUtils';
import type { PoiFormValues } from '@/types';
import PoiPersonaPicker from './PoiPersonaPicker';
import PoiSectionCard from './PoiSectionCard';

interface PoiAiSearchSectionProps {
  values: PoiFormValues;
  onChange: PoiFieldChange;
}

interface InlineFieldProps {
  label: string;
  icon: string;
  iconClass: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

/** Ô thông tin dạng thẻ của Stitch, cho phép sửa trực tiếp */
function InlineField({ label, icon, iconClass, value, placeholder, onChange }: InlineFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label-sm text-label-sm font-semibold text-outline">{label}</span>
      <label className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2.5 font-body-md text-body-md font-medium text-on-surface focus-within:ring-2 focus-within:ring-primary/30">
        <Icon name={icon} className={`text-[18px] ${iconClass}`} />
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent placeholder:font-normal placeholder:text-outline focus:outline-none"
        />
      </label>
    </div>
  );
}

/** Mục 5: Tìm kiếm ngữ nghĩa AI — trạng thái index vector và ngữ cảnh dùng để sinh embedding */
export default function PoiAiSearchSection({ values, onChange }: PoiAiSearchSectionProps) {
  const { t } = useTranslation();
  return (
    <PoiSectionCard
      compact
      icon="manage_search"
      iconBoxClass="bg-tertiary-fixed text-tertiary"
      title={t('poiEditor.aiSearchSection.title')}
      description={t('poiEditor.aiSearchSection.description')}
      decoration={
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary-fixed/20 blur-2xl" />
      }
    >
      <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md">
        <div className="flex items-center justify-between gap-2">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            {t('poiEditor.aiSearchSection.indexStatus')}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${
              values.vectorEmbedded
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-tertiary-fixed text-on-tertiary-fixed'
            }`}
          >
            <Icon
              name={values.vectorEmbedded ? 'check_circle' : 'pending'}
              className="text-[14px]"
            />
            {values.vectorEmbedded ? t('pois.vector.indexed') : t('pois.vector.notIndexed')}
          </span>
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {values.vectorEmbedded
            ? t('poiEditor.aiSearchSection.indexedHint')
            : t('poiEditor.aiSearchSection.notIndexedHint')}
        </span>
      </div>

      <InlineField
        label={t('poiEditor.poiAiPlannerSection.peakTravelSeason')}
        icon="sunny"
        iconClass="text-tertiary"
        value={values.peakSeason}
        placeholder={t('poiEditor.poiAiPlannerSection.eGFebruaryAugust')}
        onChange={(peakSeason) => onChange('peakSeason', peakSeason)}
      />
      <InlineField
        label={t('poiEditor.poiAiPlannerSection.bestTimeDayVisit')}
        icon="wb_twilight"
        iconClass="text-secondary"
        value={values.idealTime}
        placeholder={t('poiEditor.poiAiPlannerSection.eGEvening16')}
        onChange={(idealTime) => onChange('idealTime', idealTime)}
      />

      <PoiPersonaPicker
        personas={values.personas}
        onChange={(personas) => onChange('personas', personas)}
      />
    </PoiSectionCard>
  );
}
