import { Navigate } from 'react-router-dom';
import { CLIENT_ROUTES } from '@/client/routePaths';

/** Đặt lại mật khẩu nay nằm trong luồng 3 bước của trang Quên mật khẩu (mã OTP qua email) */
export default function ResetPasswordPage() {
  return <Navigate to={CLIENT_ROUTES.FORGOT_PASSWORD} replace />;
}
