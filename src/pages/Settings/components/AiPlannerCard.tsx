import Icon from '../../../components/common/Icon';
import {
  MAP_SYNC_OPTIONS,
  MAX_POI_PER_DAY_OPTIONS,
  PLATFORM_INFO,
  POI_TRUST_RANGE,
  POI_TRUST_SCALE,
} from '../../../constants/settings';
import type { SystemSettings } from '../../../types/admin';
import type { SettingsFieldChange } from '../settingsUtils';
import SettingsCard from './SettingsCard';

interface AiPlannerCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
}

export default function AiPlannerCard({ values, onChange }: AiPlannerCardProps) {
  return (
    <SettingsCard
      icon="smart_toy"
      title="Thông số tích hợp AI Travel Planner"
      description="Thuật toán lập lịch trình, định vị và trọng số tối ưu gợi ý POI"
      aside={<Icon name="auto_awesome" className="text-tertiary" />}
    >
      <div className="space-y-space-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="poi-trust-threshold"
              className="font-label-md text-label-md text-on-surface-variant"
            >
              Ngưỡng điểm tín nhiệm tối thiểu của POI
            </label>
            <div className="flex items-center gap-1">
              <span className="font-display-sm text-headline-sm font-bold text-primary">
                {values.poiTrustThreshold}
              </span>
              <span className="font-label-sm text-label-sm text-outline">/ 100 Điểm</span>
            </div>
          </div>
          <input
            id="poi-trust-threshold"
            type="range"
            min={POI_TRUST_RANGE.min}
            max={POI_TRUST_RANGE.max}
            value={values.poiTrustThreshold}
            onChange={(event) => onChange('poiTrustThreshold', Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary"
          />
          <div className="flex justify-between font-label-sm text-label-sm text-outline">
            {POI_TRUST_SCALE.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="map-sync-frequency"
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
          >
            Tần suất đồng bộ dữ liệu bản đồ quốc gia (OSM &amp; Google Maps)
          </label>
          <div className="relative">
            <select
              id="map-sync-frequency"
              value={values.mapSyncFrequency}
              onChange={(event) => {
                const next = MAP_SYNC_OPTIONS.find((option) => option.value === event.target.value);
                if (next) onChange('mapSyncFrequency', next.value);
              }}
              className="h-11 w-full cursor-pointer appearance-none rounded-xl bg-surface-container-low px-space-md pr-9 font-body-md text-body-md text-on-surface outline-none focus:bg-surface-container-lowest"
            >
              {MAP_SYNC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon
              name="sync"
              className="pointer-events-none absolute top-3 right-3 text-[18px] text-outline"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Giới hạn số điểm đến (POI) tối đa trong 1 ngày lịch trình
            </span>
            <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">
              Tránh quá tải trải nghiệm du khách
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {MAX_POI_PER_DAY_OPTIONS.map((count) => {
              const selected = values.maxPoiPerDay === count;
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange('maxPoiPerDay', count)}
                  className={`flex h-10 items-center justify-center rounded-xl font-label-md text-label-md transition-colors ${
                    selected
                      ? 'bg-primary font-bold text-on-primary shadow-sm'
                      : 'bg-surface-container-low font-semibold text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {selected ? `${count} POI` : count}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-surface-container-low/70 p-space-md">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Độ chính xác mô hình đề xuất AI
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {PLATFORM_INFO.aiAccuracy}%
            </span>
          </div>
          <svg
            className="h-9 w-32 overflow-visible text-primary"
            fill="none"
            viewBox="0 0 100 28"
            aria-hidden="true"
          >
            <path
              d="M0 24L15 20L30 22L45 14L60 16L75 8L90 10L100 3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            />
            <circle className="fill-primary" cx="100" cy="3" r="3" />
          </svg>
        </div>
      </div>
    </SettingsCard>
  );
}
