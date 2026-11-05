/**
 * Vì sao tab này bị đưa về trang đăng nhập — lưu trong sessionStorage nên chỉ riêng tab đó,
 * vẫn còn khi F5 / quay lại tab sau một lúc, và được xoá khi đăng nhập lại hoặc tự đăng xuất.
 * idle: không thao tác quá lâu · expired: phiên hết hạn / bị thu hồi (API trả 401)
 */
export type SessionEndReason = 'idle' | 'expired';

export function sessionEnd(key: string) {
  return {
    get(): SessionEndReason | null {
      try {
        const value = window.sessionStorage.getItem(key);
        return value === 'idle' || value === 'expired' ? value : null;
      } catch {
        return null;
      }
    },
    set(reason: SessionEndReason): void {
      try {
        window.sessionStorage.setItem(key, reason);
      } catch {
        // storage bị chặn: trang đăng nhập vẫn mở, chỉ thiếu lời giải thích
      }
    },
    clear(): void {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // bỏ qua
      }
    },
  };
}

export const clientSessionEnd = sessionEnd('smarttravel.client.sessionEnd');
export const adminSessionEnd = sessionEnd('smarttravel.admin.sessionEnd');
