import Icon from '../../../components/common/Icon';
import type { PoiFormValues } from '../../../types/admin';
import { cityFromAddress, priorityNote, type PoiFieldChange } from '../poiFormUtils';
import PoiPersonaPicker from './PoiPersonaPicker';
import PoiRangeBar from './PoiRangeBar';
import PoiSectionCard from './PoiSectionCard';

interface PoiAiPlannerSectionProps {
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

export default function PoiAiPlannerSection({ values, onChange }: PoiAiPlannerSectionProps) {
  return (
    <PoiSectionCard
      compact
      icon="psychology"
      iconBoxClass="bg-tertiary-fixed text-tertiary"
      title="5. Tham số AI Planner"
      description="Huấn luyện thuật toán gợi ý lộ trình"
      decoration={
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary-fixed/20 blur-2xl" />
      }
      badge={
        <span className="rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-container">
          Engine v2.4
        </span>
      }
    >
      <InlineField
        label="Mùa cao điểm du lịch"
        icon="sunny"
        iconClass="text-tertiary"
        value={values.peakSeason}
        placeholder="Ví dụ: Tháng 2 - Tháng 8"
        onChange={(peakSeason) => onChange('peakSeason', peakSeason)}
      />
      <InlineField
        label="Thời điểm tham quan lý tưởng trong ngày"
        icon="wb_twilight"
        iconClass="text-secondary"
        value={values.idealTime}
        placeholder="Ví dụ: Buổi tối (16:30 - 20:30)"
        onChange={(idealTime) => onChange('idealTime', idealTime)}
      />

      <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            Độ ưu tiên thuật toán (Priority Score)
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            {values.priorityScore} / 100
          </span>
        </div>
        <PoiRangeBar
          label="Độ ưu tiên thuật toán"
          heightClass="h-2"
          value={values.priorityScore}
          min={0}
          max={100}
          onChange={(priorityScore) => onChange('priorityScore', priorityScore)}
        />
        <span className="font-body-sm text-body-sm font-medium text-secondary">
          {priorityNote(values.priorityScore, cityFromAddress(values.address))}
        </span>
      </div>

      <PoiPersonaPicker
        personas={values.personas}
        onChange={(personas) => onChange('personas', personas)}
      />
    </PoiSectionCard>
  );
}
