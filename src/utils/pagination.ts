export type PageItem = number | 'ellipsis';

/** Số trang hiện mỗi bên trang đang xem */
const SIBLINGS = 2;

/**
 * Danh sách nút phân trang: luôn có trang đầu, trang cuối và 2 trang mỗi bên trang hiện tại.
 * Ví dụ trang 7/17 -> [1, …, 5, 6, 7, 8, 9, …, 17]; trang 2/17 -> [1, 2, 3, 4, 5, …, 17].
 */
export function getPageItems(current: number, totalPages: number): PageItem[] {
  // Đủ chỗ hiện hết (đầu + cuối + 5 trang giữa + 2 dấu …)
  if (totalPages <= SIBLINGS * 2 + 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  // Giữ cố định số nút khi ở gần đầu / cuối để thanh không co giãn
  const windowSize = SIBLINGS * 2 + 1;
  let start = Math.max(2, current - SIBLINGS);
  let end = Math.min(totalPages - 1, current + SIBLINGS);
  if (current - SIBLINGS <= 2) {
    start = 2;
    end = windowSize + 1;
  } else if (current + SIBLINGS >= totalPages - 1) {
    end = totalPages - 1;
    start = totalPages - windowSize;
  }

  // "…" chỉ che đúng 1 trang thì hiện luôn số trang đó
  if (start === 3) start = 2;
  if (end === totalPages - 2) end = totalPages - 1;

  const items: PageItem[] = [1];
  if (start > 2) items.push('ellipsis');
  for (let page = start; page <= end; page++) items.push(page);
  if (end < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);
  return items;
}
