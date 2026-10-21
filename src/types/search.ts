/** Tìm kiếm ngữ nghĩa AI (pgvector) */

export type SemanticTarget = 'pois' | 'listings';

export interface SemanticSearchRequest {
  target: SemanticTarget;
  /** Câu truy vấn tự nhiên, ví dụ "bãi biển yên tĩnh cho gia đình" */
  query: string;
  /** Số kết quả tối đa (top-K) */
  topK: number;
  /** Ngưỡng độ tương đồng tối thiểu (%) */
  minSimilarity: number;
}

export interface SemanticMatch {
  id: string;
  /** Độ tương đồng AI (cosine similarity) theo %, ví dụ 98 */
  score: number;
}

/** Tài liệu dùng để mô phỏng embedding ở chế độ mock (server thật dùng vector đã index) */
export interface SemanticDocument {
  id: string;
  title: string;
  text: string;
  /** Chưa index vector thì không thể tìm thấy bằng AI */
  indexed: boolean;
}
