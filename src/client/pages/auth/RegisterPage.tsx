import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import ClientAuthLayout, { SocialLogin } from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { FormAlert } from '@/client/ui/Blocks';
import { PrimaryButton, TextLink } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { isValidEmail, isValidPassword, PASSWORD_HINT } from '@/client/utils/validation';

export default function RegisterPage() {
  const { register } = useClientAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Tên phải có ít nhất 2 ký tự';
    if (!isValidEmail(email)) next.email = 'Email không hợp lệ';
    if (!isValidPassword(password)) next.password = PASSWORD_HINT;
    if (confirm !== password) next.confirm = 'Mật khẩu xác nhận không khớp';
    if (!agreed) next.agreed = 'Cần đồng ý với điều khoản';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await register(name, email, password);
      navigate(CLIENT_ROUTES.HOME, { replace: true });
    } catch (error) {
      if (error instanceof ClientApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
      }
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  return (
    <ClientAuthLayout title="Đăng ký">
      <h1 className="text-center text-[21px] font-extrabold text-[#183943]">
        Bắt đầu hành trình ✨
      </h1>
      <p className="mb-5 text-center text-[12px] text-[#657985]">
        Trải nghiệm lập kế hoạch du lịch Việt Nam thông minh, cá nhân hóa từng khoảnh khắc.
      </p>

      <form
        onSubmit={(event) => void submit(event)}
        noValidate
        className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
      >
        {formError && <FormAlert message={formError} />}
        <Field
          label="Họ và tên"
          autoComplete="name"
          placeholder="Nguyễn Hoàng Nam"
          value={name}
          onChange={setName}
          error={errors.name}
        />
        <Field
          label="Địa chỉ Email"
          type="email"
          autoComplete="email"
          placeholder="hoang.nam@email.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          label="Mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={setPassword}
          error={errors.password}
          hint={PASSWORD_HINT}
        />
        <Field
          label="Xác nhận mật khẩu"
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
        />
        <label className="mb-4 flex cursor-pointer items-start gap-2 text-[11px] text-[#546B75] select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Smart Travel.
        </label>
        {errors.agreed && <p className="-mt-2 mb-3 text-xs text-client-danger">{errors.agreed}</p>}
        <PrimaryButton type="submit" loading={busy}>
          Tạo tài khoản ngay
        </PrimaryButton>
      </form>

      <SocialLogin />
      <TextLink to={CLIENT_ROUTES.LOGIN}>Đã có tài khoản? Đăng nhập ngay</TextLink>
    </ClientAuthLayout>
  );
}
