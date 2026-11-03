import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClientAuthLayout from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { FormAlert, Notice } from '@/client/ui/Blocks';
import { PrimaryButton, TextLink } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { isValidPassword, PASSWORD_HINT } from '@/client/utils/validation';

/**
 * Đặt lại mật khẩu bằng mã từ email — theo ResetPasswordScreen của mobile.
 * Mã có thể đến qua liên kết ?token=…; BE chưa có API nên chỉ kiểm tra dữ liệu.
 */
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    if (!token.trim()) return setError('Cần mã khôi phục từ email');
    if (!isValidPassword(password)) return setError(`Mật khẩu mới: ${PASSWORD_HINT}`);
    if (password !== confirm) return setError('Xác nhận mật khẩu không khớp');
    setError(null);
    setSubmitted(true);
  };

  return (
    <ClientAuthLayout title="Đặt lại mật khẩu">
      <h1 className="mb-2 text-center text-[22px] font-extrabold text-[#183943]">
        Đặt lại mật khẩu
      </h1>
      <p className="mb-6 text-center text-[12px] text-[#72828E]">
        Nhập mã khôi phục nhận qua email và tạo mật khẩu mới.
      </p>

      <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-4">
        {error && <FormAlert message={error} />}
        <Field
          label="Mã khôi phục"
          icon="pin"
          placeholder="Nhập mã từ email"
          autoComplete="one-time-code"
          value={token}
          onChange={setToken}
        />
        <Field
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          hint={PASSWORD_HINT}
        />
        <Field
          label="Xác nhận mật khẩu mới"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={setConfirm}
        />
        {submitted && (
          <Notice tone="warning">
            Máy chủ chưa hỗ trợ đặt lại mật khẩu bằng mã khôi phục. Vui lòng liên hệ quản trị viên.
          </Notice>
        )}
        <PrimaryButton type="submit">Đặt lại mật khẩu</PrimaryButton>
      </form>
      <TextLink to={CLIENT_ROUTES.LOGIN}>Quay lại đăng nhập</TextLink>
    </ClientAuthLayout>
  );
}
