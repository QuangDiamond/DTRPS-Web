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

/** Chữ viết tắt từ tối đa 2 từ cuối, ví dụ "Nguyễn Văn Hùng" → "VH" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
