export type PageItem = number | 'ellipsis';

/** Danh sách nút phân trang, ví dụ trang 1/184 -> [1, 2, 3, '...', 184] */
export function getPageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (current <= 3) return [1, 2, 3, 'ellipsis', totalPages];
  if (current >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', current, 'ellipsis', totalPages];
}
