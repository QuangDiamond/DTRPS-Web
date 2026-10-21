import { useCallback, useState } from 'react';
import { searchService } from '@/services/searchService';
import type { SemanticDocument, SemanticTarget } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { useSettings } from './useSettings';

export interface SemanticSearchState {
  /** Câu đang nhập */
  query: string;
  setQuery: (query: string) => void;
  /** Câu đã tìm (null = chưa dùng tìm kiếm AI) */
  appliedQuery: string | null;
  /** Độ tương đồng (%) theo id — chỉ chứa các kết quả vượt ngưỡng */
  scores: Map<string, number> | null;
  searching: boolean;
  error: string | null;
  search: () => Promise<void>;
  clear: () => void;
}

/**
 * Tìm kiếm ngữ nghĩa AI (pgvector) cho một danh sách.
 * Ngưỡng tương đồng và top-K lấy từ Cài đặt hệ thống › Tìm kiếm AI.
 */
export function useSemanticSearch(
  target: SemanticTarget,
  buildCorpus: () => SemanticDocument[],
): SemanticSearchState {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState<string | null>(null);
  const [scores, setScores] = useState<Map<string, number> | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setError(null);
    try {
      const { matches } = await searchService.semantic(
        {
          target,
          query: trimmed,
          topK: settings.searchTopK,
          minSimilarity: settings.minSimilarity,
        },
        buildCorpus(),
      );
      setScores(new Map(matches.map((match) => [match.id, match.score])));
      setAppliedQuery(trimmed);
    } catch (searchError) {
      setError(getErrorMessage(searchError));
    } finally {
      setSearching(false);
    }
  }, [query, target, settings.searchTopK, settings.minSimilarity, buildCorpus]);

  const clear = useCallback(() => {
    setQuery('');
    setAppliedQuery(null);
    setScores(null);
    setError(null);
  }, []);

  return { query, setQuery, appliedQuery, scores, searching, error, search, clear };
}
