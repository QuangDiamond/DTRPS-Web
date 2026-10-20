import { useState, type FormEvent } from 'react';
import Icon from '../../../components/common/Icon';
import { PASSWORD_ROTATION_DAYS } from '../../../constants/adminProfile';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { useToast } from '../../../hooks/useToast';
import { getErrorMessage } from '../../../utils/error';
import { daysSince, getPasswordStrength } from '../profileUtils';
import ProfileCardHeader, { PROFILE_CARD_CLASS } from './ProfileCardHeader';
import ProfileInput from './ProfileInput';

interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

const EMPTY_FORM: PasswordForm = { current: '', next: '', confirm: '' };
const STRENGTH_SEGMENTS = 4;

export default function ChangePasswordCard() {
  const { details, changePassword } = useAdminProfile();
  const { showToast } = useToast();
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<PasswordForm>>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const strength = getPasswordStrength(form.next);
  const passwordAge = daysSince(details.passwordChangedAt);

  const change = (key: keyof PasswordForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<PasswordForm> = {};
    if (!form.current) nextErrors.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (strength.score < STRENGTH_SEGMENTS) {
      nextErrors.next = 'Mật khẩu mới cần đủ 8 ký tự, chữ hoa, chữ số và ký tự đặc biệt';
    } else if (form.next === form.current) {
      nextErrors.next = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }
    if (!form.confirm || form.confirm !== form.next)
      nextErrors.confirm = 'Mật khẩu xác nhận không khớp';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await changePassword(form.current, form.next);
      setForm(EMPTY_FORM);
      setShowCurrent(false);
      showToast('Mật khẩu quản trị viên đã được đổi thành công!');
    } catch (error) {
      setErrors({ current: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={PROFILE_CARD_CLASS}>
      <ProfileCardHeader
        icon="password"
        title="Đổi mật khẩu tài khoản"
        description={`Khuyến nghị thay đổi mật khẩu định kỳ ${PASSWORD_ROTATION_DAYS} ngày theo tiêu chuẩn ISO 27001`}
      />
      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
        <ProfileInput
          label="Mật khẩu hiện tại"
          icon="key"
          type={showCurrent ? 'text' : 'password'}
          autoComplete="current-password"
          value={form.current}
          error={errors.current}
          onChange={(value) => change('current', value)}
          trailing={
            <button
              type="button"
              title={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowCurrent((value) => !value)}
              className="text-outline transition-colors hover:text-on-surface"
            >
              <Icon name={showCurrent ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label="Mật khẩu mới"
            icon="lock_reset"
            type="password"
            autoComplete="new-password"
            value={form.next}
            error={errors.next}
            onChange={(value) => change('next', value)}
          />
          <ProfileInput
            label="Xác nhận mật khẩu mới"
            icon="check"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            error={errors.confirm}
            onChange={(value) => change('confirm', value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-surface-container-low p-space-sm">
          <div className="flex items-center justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Độ mạnh mật khẩu:</span>
            <span className={`flex items-center gap-1 font-bold ${strength.textClass}`}>
              {strength.score >= STRENGTH_SEGMENTS && (
                <Icon name="check_circle" className="text-[16px]" />
              )}
              {strength.label}
            </span>
          </div>
          <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-surface-container">
            {Array.from({ length: STRENGTH_SEGMENTS }, (_, index) => (
              <div
                key={index}
                className={`h-full flex-1 rounded-full transition-colors ${
                  index < strength.score ? strength.barClass : 'bg-surface-container-high'
                }`}
              />
            ))}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Bao gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt (@, #, !, $). Lần đổi gần nhất:{' '}
            {passwordAge === 0 ? 'hôm nay' : `${passwordAge} ngày trước`}.
          </span>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-secondary disabled:cursor-wait disabled:opacity-70"
          >
            <Icon
              name={submitting ? 'progress_activity' : 'vpn_key'}
              className={`text-[18px] ${submitting ? 'animate-spin' : ''}`}
            />
            {submitting ? 'Đang xác thực...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
}
