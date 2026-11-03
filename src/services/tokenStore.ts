/**
 * Lưu token của phiên đăng nhập admin (cùng nơi lưu với hồ sơ admin trong AuthProvider).
 * Access token sống ngắn (mặc định 15 phút); refresh token dùng để lấy cặp token mới.
 */

const TOKEN_KEY = 'smarttravel.token';
const REFRESH_KEY = 'smarttravel.refreshToken';

function storages(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

function read(key: string): string | null {
  for (const storage of storages()) {
    try {
      const value = storage.getItem(key);
      if (value) return value;
    } catch {
      // storage bị chặn → coi như chưa có
    }
  }
  return null;
}

/** Nơi đang lưu phiên: localStorage nếu "Ghi nhớ đăng nhập", ngược lại sessionStorage */
function currentStorage(): Storage | null {
  for (const storage of storages()) {
    try {
      if (storage.getItem(TOKEN_KEY) || storage.getItem(REFRESH_KEY)) return storage;
    } catch {
      // bỏ qua
    }
  }
  return null;
}

export function getAccessToken(): string | null {
  return read(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return read(REFRESH_KEY);
}

/** remember = true → localStorage (giữ sau khi đóng trình duyệt), ngược lại sessionStorage */
export function setTokens(
  accessToken: string,
  refreshToken: string | null,
  remember: boolean,
): void {
  clearAccessToken();
  try {
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) storage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    // Không lưu được thì token chỉ còn hiệu lực trong bộ nhớ của request hiện tại
  }
}

/** Thay cặp token sau khi làm mới, giữ nguyên nơi lưu cũ */
export function replaceTokens(accessToken: string, refreshToken: string): void {
  const storage = currentStorage();
  setTokens(accessToken, refreshToken, storage !== window.sessionStorage);
}

export function setAccessToken(token: string, remember: boolean): void {
  setTokens(token, null, remember);
}

export function clearAccessToken(): void {
  for (const storage of storages()) {
    try {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_KEY);
    } catch {
      // bỏ qua
    }
  }
}
