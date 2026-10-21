import { useTranslation } from 'react-i18next';
import Icon from './Icon';

/** Badge độ tương đồng AI, ví dụ "98% AI match" */
export function AiMatchBadge({ score }: { score: number }) {
  const { t } = useTranslation();
  const tone =
    score >= 90
      ? 'bg-secondary-container text-on-secondary-container'
      : score >= 75
        ? 'bg-primary-fixed/60 text-on-primary-fixed'
        : 'bg-tertiary-fixed text-on-tertiary-fixed';
  return (
    <span
      title={t('search.semantic.matchTitle')}
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 font-label-sm text-[11px] font-bold whitespace-nowrap ${tone}`}
    >
      <Icon name="auto_awesome" filled className="text-[12px]" />
      {t('search.semantic.match', { score })}
    </span>
  );
}

/** Trạng thái index vector (pgvector) của một bản ghi */
export function VectorIndexBadge({ indexed }: { indexed: boolean }) {
  const { t } = useTranslation();
  return (
    <span
      title={indexed ? t('pois.vector.indexedTooltip') : t('pois.vector.notIndexedTooltip')}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-[11px] font-semibold whitespace-nowrap ${
        indexed
          ? 'bg-secondary-container/70 text-on-secondary-container'
          : 'bg-surface-container-high text-outline'
      }`}
    >
      <Icon name={indexed ? 'data_check' : 'pending'} className="text-[13px]" />
      {indexed ? t('pois.vector.indexed') : t('pois.vector.notIndexed')}
    </span>
  );
}
