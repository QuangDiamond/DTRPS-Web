/** Lưu access token của phiên đăng nhập (cùng nơi lưu với hồ sơ admin trong AuthProvider) */

const TOKEN_KEY = 'smarttravel.token';

function storages(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

export function getAccessToken(): string | null {
  for (const storage of storages()) {
    try {
      const token = storage.getItem(TOKEN_KEY);
      if (token) return token;
    } catch {
      // storage bị chặn → coi như chưa có token
    }
  }
  return null;
}

/** remember = true → localStorage (giữ sau khi đóng trình duyệt), ngược lại sessionStorage */
export function setAccessToken(token: string, remember: boolean): void {
  clearAccessToken();
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Không lưu được thì token chỉ còn hiệu lực trong bộ nhớ của request hiện tại
  }
}

export function clearAccessToken(): void {
  for (const storage of storages()) {
    try {
      storage.removeItem(TOKEN_KEY);
    } catch {
      // bỏ qua
    }
  }
}
