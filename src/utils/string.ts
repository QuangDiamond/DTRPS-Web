/** Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa thường và dấu tiếng Việt */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}
