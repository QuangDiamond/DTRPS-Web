import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import {
  MAP_SYNC_OPTIONS,
  PLATFORM_INFO,
  SEARCH_TOP_K_OPTIONS,
  SIMILARITY_RANGE,
  SIMILARITY_SCALE,
} from '@/constants/settings';
import type { SettingsFieldChange } from '@/pages/Settings/settingsUtils';
import type { SystemSettings } from '@/types';
import SettingsCard from './SettingsCard';

interface AiSearchCardProps {
  values: SystemSettings;
  onChange: SettingsFieldChange;
}

/** Tham số tìm kiếm ngữ nghĩa AI: ngưỡng cosine similarity, top-K, model embedding (pgvector) */
export default function AiSearchCard({ values, onChange }: AiSearchCardProps) {
  const { t } = useTranslation();
  return (
    <SettingsCard
      icon="manage_search"
      title={t('settings.aiSearchCard.title')}
      description={t('settings.aiSearchCard.description')}
      aside={<Icon name="auto_awesome" className="text-tertiary" />}
    >
      <div className="space-y-space-md">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="min-similarity"
              className="font-label-md text-label-md text-on-surface-variant"
            >
              {t('settings.aiSearchCard.minSimilarity')}
            </label>
            <span className="font-display-sm text-headline-sm font-bold text-primary">
              {values.minSimilarity}%
            </span>
          </div>
          <input
            id="min-similarity"
            type="range"
            min={SIMILARITY_RANGE.min}
            max={SIMILARITY_RANGE.max}
            value={values.minSimilarity}
            onChange={(event) => onChange('minSimilarity', Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary"
          />
          <div className="flex justify-between font-label-sm text-label-sm text-outline">
            {SIMILARITY_SCALE.map((mark) => (
              <span key={mark.value}>{mark.label}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant">
              {t('settings.aiSearchCard.topK')}
            </span>
            <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">
              {t('settings.aiSearchCard.topKHint')}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SEARCH_TOP_K_OPTIONS.map((count) => {
              const selected = values.searchTopK === count;
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange('searchTopK', count)}
                  className={`flex h-10 items-center justify-center rounded-xl font-label-md text-label-md transition-colors ${
                    selected
                      ? 'bg-primary font-bold text-on-primary shadow-sm'
                      : 'bg-surface-container-low font-semibold text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {selected ? t('settings.aiSearchCard.topKSelected', { count }) : count}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="map-sync-frequency"
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
          >
            {t('settings.aiPlannerCard.nationalMapDataSync')}
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

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="flex flex-col rounded-xl bg-surface-container-low/70 p-space-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('settings.aiSearchCard.embeddingModel')}
            </span>
            <span className="font-label-md text-label-md font-bold text-on-surface">
              {PLATFORM_INFO.embeddingModel}
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              {t('settings.aiSearchCard.dimensions', { count: PLATFORM_INFO.embeddingDimensions })}
            </span>
          </div>
          <div className="flex flex-col rounded-xl bg-surface-container-low/70 p-space-md">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {t('settings.aiSearchCard.recall')}
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {PLATFORM_INFO.aiAccuracy}%
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              {t('settings.aiSearchCard.indexType')}
            </span>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
