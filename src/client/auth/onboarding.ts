/**
 * Tài khoản vừa đăng ký trên máy này: lần đăng nhập đầu tiên sẽ đi qua trang câu hỏi sở thích
 * trước khi vào trang chủ. Lưu email (chữ thường) trong localStorage, dùng xong thì xoá.
 */
const KEY = 'smarttravel.client.onboarding';

export const onboarding = {
  mark(email: string): void {
    try {
      window.localStorage.setItem(KEY, email.trim().toLowerCase());
    } catch {
      // storage bị chặn: bỏ qua bước câu hỏi, vẫn đăng nhập bình thường
    }
  },
  /** true nếu email này vừa đăng ký và chưa qua bước câu hỏi — đồng thời xoá đánh dấu */
  take(email: string): boolean {
    try {
      if (window.localStorage.getItem(KEY) !== email.trim().toLowerCase()) return false;
      window.localStorage.removeItem(KEY);
      return true;
    } catch {
      return false;
    }
  },
};
