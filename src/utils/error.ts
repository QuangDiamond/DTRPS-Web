export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra, vui lòng thử lại';
}
