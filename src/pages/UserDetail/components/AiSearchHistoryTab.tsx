import { useTranslation } from 'react-i18next';
import { AiMatchBadge, Icon } from '@/components/common';
import type { UserAiSearch } from '@/types';
import { formatDayTime } from '@/utils/format';

interface AiSearchHistoryTabProps {
  searches: UserAiSearch[];
  /** Tổng số lượt tìm kiếm AI của người dùng (danh sách chỉ hiện các lượt gần nhất) */
  total: number;
}

/** Tab Lịch sử tìm kiếm AI (pgvector) của người dùng */
export default function AiSearchHistoryTab({ searches, total }: AiSearchHistoryTabProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm">
      <div className="mb-space-md flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-on-surface">
          <Icon name="manage_search" className="text-[22px] text-primary" />
          {t('userDetail.aiSearchTab.title')}
        </h4>
        <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
          {t('userDetail.aiSearchTab.showing', { shown: searches.length, count: total })}
        </span>
      </div>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-on-surface-variant">
          <Icon name="travel_explore" className="text-[36px] text-outline" />
          <span className="font-body-md text-body-md">{t('userDetail.aiSearchTab.empty')}</span>
        </div>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {searches.map((search) => (
            <li
              key={search.id}
              className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-body-md text-body-md font-semibold text-on-surface">
                  “{search.query}”
                </span>
                <span className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
                  <span className="rounded-full bg-surface-container-highest px-2 py-0.5 font-semibold">
                    {t(
                      search.target === 'pois'
                        ? 'userDetail.aiSearchTab.targetPois'
                        : 'userDetail.aiSearchTab.targetListings',
                    )}
                  </span>
                  <span>{t('userDetail.aiSearchTab.results', { count: search.resultCount })}</span>
                  {search.topMatch && (
                    <span className="flex items-center gap-1">
                      • {t('userDetail.aiSearchTab.topMatch')}:{' '}
                      <strong className="text-on-surface">{search.topMatch}</strong>
                    </span>
                  )}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {search.topScore !== undefined && <AiMatchBadge score={search.topScore} />}
                <span className="font-label-sm text-label-sm text-outline">
                  {formatDayTime(search.searchedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
