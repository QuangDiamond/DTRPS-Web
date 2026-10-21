import { mockSemanticSearch } from '@/mocks/builders/semanticSearchMock';
import type {
  SemanticDocument,
  SemanticMatch,
  SemanticSearchRequest,
  SemanticTarget,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { writeRequest, writeRequestWithResult } from './request';

export const searchService = {
  /**
   * POST /search/semantic — server sinh embedding cho câu truy vấn và so cosine similarity trên pgvector.
   * `corpus` chỉ dùng ở chế độ mock để mô phỏng kết quả.
   */
  semantic: (request: SemanticSearchRequest, corpus: SemanticDocument[]) =>
    writeRequestWithResult<{ matches: SemanticMatch[] }>(
      ENDPOINTS.search.semantic,
      'POST',
      request,
      () => ({
        matches: mockSemanticSearch(request, corpus),
      }),
    ),
  /** POST /search/index — sinh embedding & index lại các bản ghi vào pgvector */
  reindex: (target: SemanticTarget, ids: string[]) =>
    writeRequest(ENDPOINTS.search.reindex, 'POST', { target, ids }),
};
