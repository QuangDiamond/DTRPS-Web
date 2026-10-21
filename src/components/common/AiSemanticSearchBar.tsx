import { useTranslation } from 'react-i18next';
import type { SemanticSearchState } from '@/hooks/useSemanticSearch';
import Icon from './Icon';

interface AiSemanticSearchBarProps {
  state: SemanticSearchState;
  placeholder: string;
  /** Số kết quả AI tìm được (sau khi kết hợp bộ lọc của trang) */
  resultCount: number;
}

/** Ô tìm kiếm thông minh bằng câu lệnh tự nhiên (pgvector) + dải kết quả */
export default function AiSemanticSearchBar({
  state,
  placeholder,
  resultCount,
}: AiSemanticSearchBarProps) {
  const { t } = useTranslation();
  const { query, setQuery, appliedQuery, searching, error, search, clear } = state;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-primary/15 bg-gradient-to-r from-secondary-container/40 to-surface-container-lowest p-3 shadow-xs">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <span className="flex shrink-0 items-center gap-1.5 font-label-md text-label-md font-semibold text-primary">
          <Icon name="auto_awesome" filled className="text-[18px]" />
          {t('search.semantic.label')}
        </span>
        <div className="relative flex-1">
          <Icon
            name="manage_search"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-primary"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={t('search.semantic.label')}
            className="h-10 w-full rounded-xl bg-surface-container-lowest pr-3 pl-10 font-body-sm text-body-sm text-on-surface shadow-xs placeholder:text-outline focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-50"
        >
          <Icon
            name={searching ? 'progress_activity' : 'travel_explore'}
            className={`text-[18px] ${searching ? 'animate-spin' : ''}`}
          />
          {searching ? t('search.semantic.searching') : t('search.semantic.submit')}
        </button>
      </form>

      {error && (
        <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
          <Icon name="error" className="text-[14px]" /> {error}
        </span>
      )}
      {appliedQuery && !error && (
        <div className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <span>{t('search.semantic.results', { count: resultCount, query: appliedQuery })}</span>
          <span className="text-outline">• {t('search.semantic.sortedBySimilarity')}</span>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
          >
            <Icon name="close" className="text-[14px]" />
            {t('search.semantic.clear')}
          </button>
        </div>
      )}
    </div>
  );
}

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
