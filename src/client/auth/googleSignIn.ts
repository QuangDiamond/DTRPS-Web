/**
 * Đăng nhập Google (Google Identity Services): mở cửa sổ chọn tài khoản của Google và lấy access
 * token; BE kiểm tra token với Google rồi đăng nhập / tạo tài khoản. Chỉ cần Client ID (công khai).
 */
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const SCOPES = 'openid email profile';

export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type?: string }) => void;
  }) => TokenClient;
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } };
  }
}

/** Người dùng tự đóng cửa sổ Google — không coi là lỗi */
export class GoogleCancelled extends Error {}

let loading: Promise<GoogleOAuth2> | null = null;

/** Tải thư viện của Google một lần (gọi sẵn khi nút hiện ra để bấm là mở ngay, không bị chặn popup) */
export function loadGoogle(): Promise<GoogleOAuth2> {
  const ready = window.google?.accounts?.oauth2;
  if (ready) return Promise.resolve(ready);
  loading ??= new Promise<GoogleOAuth2>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      const oauth2 = window.google?.accounts?.oauth2;
      if (oauth2) resolve(oauth2);
      else reject(new Error('Không tải được đăng nhập Google'));
    };
    script.onerror = () => {
      loading = null;
      reject(new Error('Không tải được đăng nhập Google, kiểm tra mạng rồi thử lại'));
    };
    document.head.appendChild(script);
  });
  return loading;
}

/** Mở cửa sổ chọn tài khoản Google, trả về access token */
export function requestGoogleToken(oauth2: GoogleOAuth2): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error('Google chưa cấp quyền đăng nhập, vui lòng thử lại'));
      },
      error_callback: (error) =>
        reject(
          error.type === 'popup_closed' || error.type === 'popup_failed_to_open'
            ? new GoogleCancelled()
            : new Error('Đăng nhập Google không thành công, vui lòng thử lại'),
        ),
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });
}
