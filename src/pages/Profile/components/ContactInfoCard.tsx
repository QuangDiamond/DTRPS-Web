import { useState, type FormEvent } from 'react';
import Icon from '../../../components/common/Icon';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { useToast } from '../../../hooks/useToast';
import type { AdminContactInfo } from '../../../types/admin';
import ProfileCardHeader, { PROFILE_CARD_CLASS } from './ProfileCardHeader';
import ProfileInput from './ProfileInput';

type ContactErrors = Partial<Record<keyof AdminContactInfo, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\s-]{9,15}$/;

function validate(values: AdminContactInfo): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
  if (!EMAIL_PATTERN.test(values.socAlertEmail.trim())) errors.socAlertEmail = 'Email không hợp lệ';
  if (!PHONE_PATTERN.test(values.hotline.trim())) errors.hotline = 'Số điện thoại không hợp lệ';
  return errors;
}

export default function ContactInfoCard({ roleTitle }: { roleTitle: string }) {
  const { details, updateContact } = useAdminProfile();
  const { showToast } = useToast();
  const saved: AdminContactInfo = {
    fullName: details.fullName,
    socAlertEmail: details.socAlertEmail,
    hotline: details.hotline,
  };
  const [values, setValues] = useState<AdminContactInfo>(saved);
  const [errors, setErrors] = useState<ContactErrors>({});
  const isDirty = JSON.stringify(values) !== JSON.stringify(saved);

  const change = (key: keyof AdminContactInfo, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('Vui lòng kiểm tra lại thông tin liên hệ', 'error');
      return;
    }
    if (!isDirty) {
      showToast('Không có thay đổi nào cần lưu', 'info');
      return;
    }
    const cleaned = {
      fullName: values.fullName.trim(),
      socAlertEmail: values.socAlertEmail.trim(),
      hotline: values.hotline.trim(),
    };
    updateContact(cleaned);
    setValues(cleaned);
    showToast('Thông tin liên hệ đã được lưu thành công');
  };

  const handleReset = () => {
    setValues(saved);
    setErrors({});
  };

  return (
    <div className={PROFILE_CARD_CLASS}>
      <ProfileCardHeader
        icon="badge"
        title="Chỉnh sửa thông tin liên hệ"
        description="Cập nhật định danh hiển thị trên biên bản vận hành và hồ sơ quản trị"
      />
      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label="Họ và tên Quản trị viên"
            icon="person"
            value={values.fullName}
            autoComplete="name"
            error={errors.fullName}
            onChange={(value) => change('fullName', value)}
          />
          <ProfileInput
            label="Chức danh định danh"
            icon="military_tech"
            value={roleTitle}
            readOnly
          />
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label="Email thông báo khẩn cấp (SOC Alert)"
            icon="alternate_email"
            type="email"
            value={values.socAlertEmail}
            error={errors.socAlertEmail}
            onChange={(value) => change('socAlertEmail', value)}
          />
          <ProfileInput
            label="Số điện thoại trực hotline điều hành"
            icon="phone_in_talk"
            type="tel"
            value={values.hotline}
            error={errors.hotline}
            onChange={(value) => change('hotline', value)}
          />
        </div>
        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            type="reset"
            disabled={!isDirty}
            className="rounded-full px-space-md py-2.5 font-label-md text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Hủy thay đổi
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-secondary"
          >
            <Icon name="check_circle" className="text-[18px]" />
            Cập nhật thông tin
          </button>
        </div>
      </form>
    </div>
  );
}
