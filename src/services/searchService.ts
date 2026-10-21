import type { SemanticTarget } from '@/types';
import { ENDPOINTS } from './endpoints';
import { writeRequest } from './request';

/** Tìm kiếm AI chạy trên app du khách — trang quản trị chỉ cập nhật dữ liệu tìm kiếm */
export const searchService = {
  /** POST /search/index — sinh embedding & index lại các bản ghi vào pgvector */
  reindex: (target: SemanticTarget, ids: string[]) =>
    writeRequest(ENDPOINTS.search.reindex, 'POST', { target, ids }),
};
