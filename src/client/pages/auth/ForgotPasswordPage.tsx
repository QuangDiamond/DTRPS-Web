import { type FormEvent, useState } from 'react';
import ClientAuthLayout from '@/client/layouts/ClientAuthLayout';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Notice } from '@/client/ui/Blocks';
import { PrimaryButton, TextLink } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { isValidEmail } from '@/client/utils/validation';

/**
 * Quên mật khẩu — theo ForgotPasswordScreen của mobile.
 * BE chưa có API gửi email khôi phục nên chỉ kiểm tra dữ liệu và báo chưa hỗ trợ.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <ClientAuthLayout title="Quên mật khẩu">
      <h1 className="text-center text-[22px] font-extrabold text-[#19333F]">Quên mật khẩu? 🔐</h1>
      <p className="mt-2 mb-7 text-center text-[12px] text-[#63737E]">
        Đừng lo lắng! Hãy nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn kèm liên
        kết đặt lại mật khẩu an toàn.
      </p>

      <form onSubmit={submit} noValidate className="rounded-2xl bg-white p-4">
        <Field
          label="Địa chỉ Email"
          type="email"
          autoComplete="email"
          placeholder="hoang.nam@email.com"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setSubmitted(false);
          }}
          error={error}
        />
        <div className="mb-4 rounded-xl bg-[#DFF9F5] p-3 text-[12px] text-[#147C75]">
          🛡️ Mẹo bảo mật: Liên kết khôi phục sẽ có hiệu lực trong thời gian giới hạn.
        </div>
        {submitted && (
          <Notice tone="warning">
            Máy chủ chưa hỗ trợ gửi email khôi phục mật khẩu. Vui lòng liên hệ quản trị viên để được
            cấp lại mật khẩu.
          </Notice>
        )}
        <PrimaryButton type="submit">Gửi link khôi phục</PrimaryButton>
      </form>

      <div className="mt-4 rounded-xl bg-white p-4">
        <p className="text-[13px] font-bold text-[#263C4A]">Nhận mã xác thực qua SMS / Zalo</p>
        <p className="mt-1 text-[11px] text-[#81909B]">Tùy chọn này sẽ được tích hợp sau.</p>
      </div>
      <TextLink to={CLIENT_ROUTES.RESET_PASSWORD}>Đã có mã khôi phục? Đặt lại mật khẩu</TextLink>
      <TextLink to={CLIENT_ROUTES.LOGIN}>← Quay lại Đăng nhập</TextLink>
    </ClientAuthLayout>
  );
}
