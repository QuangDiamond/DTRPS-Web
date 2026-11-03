import { type ChangeEvent, type FormEvent, type ReactNode, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { ClientApiError, errorMessage } from '@/client/api/http';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, uploadApi } from '@/client/api/uploadApi';
import { userApi } from '@/client/api/userApi';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import Avatar from '@/client/traveller/components/Avatar';
import { FormAlert } from '@/client/ui/Blocks';
import PageBar from '@/client/ui/PageBar';
import { isValidPhone, normalizePhone } from '@/client/utils/validation';

function FieldCard({
  label,
  htmlFor,
  required = false,
  right,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  right?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-3 rounded-2xl bg-white px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/30">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold text-[#123747]">
          {label}
          {required && <span className="text-[#00A5A0]"> *</span>}
        </label>
        {right}
      </div>
      <div className="mt-2 flex items-center">{children}</div>
      {error && <p className="mt-1 text-xs text-client-danger">{error}</p>}
    </div>
  );
}

/** Ngày hôm nay dạng yyyy-MM-dd (giới hạn ngày sinh) */
const today = () => new Date().toISOString().slice(0, 10);

/** Chỉnh sửa hồ sơ — theo EditProfileScreen của mobile, lưu qua PUT /api/users/me */
export default function EditProfilePage() {
  const { user, updateUser } = useClientAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  if (!user) return null;

  const pickAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({ ...previous, avatarUrl: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP' }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((previous) => ({ ...previous, avatarUrl: 'Ảnh tối đa 5MB' }));
      return;
    }
    setUploading(true);
    setErrors(({ avatarUrl: _avatar, ...rest }) => rest);
    try {
      setAvatarUrl(await uploadApi.image(file));
    } catch (uploadError) {
      setErrors((previous) => ({ ...previous, avatarUrl: errorMessage(uploadError) }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 150)
      next.name = 'Họ tên phải có từ 2 đến 150 ký tự';
    if (phone.trim() && !isValidPhone(phone)) next.phoneNumber = 'Số điện thoại không hợp lệ';
    if (dateOfBirth && dateOfBirth >= today()) next.dateOfBirth = 'Ngày sinh phải ở trong quá khứ';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const updated = await userApi.updateProfile({
        name: trimmedName,
        phoneNumber: phone.trim() ? normalizePhone(phone) : null,
        dateOfBirth: dateOfBirth || null,
        avatarUrl,
      });
      updateUser(updated);
      navigate(CLIENT_ROUTES.PROFILE);
    } catch (saveError) {
      if (saveError instanceof ClientApiError) setErrors(saveError.fieldErrors);
      setFormError(errorMessage(saveError));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageBar title="Chỉnh sửa hồ sơ" backTo={CLIENT_ROUTES.PROFILE} />

      <form onSubmit={(event) => void submit(event)} noValidate>
        <div className="flex flex-col items-center pt-2 pb-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Thay đổi ảnh đại diện"
            className="relative rounded-full shadow-[0_6px_18px_rgba(48,201,189,0.25)]"
          >
            <Avatar
              url={avatarUrl}
              size={108}
              iconSize={80}
              className="bg-[#98F0E7] text-[#006D72]"
            />
            <span className="absolute right-0 bottom-0 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#F8F7FC] bg-[#006A65] text-white">
              {uploading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Icon name="photo_camera" className="text-[20px]" />
              )}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={(event) => void pickAvatar(event)}
            className="hidden"
          />
          <p className="mt-4 text-[12px] font-medium text-[#526179]">
            Nhấn để thay đổi ảnh đại diện
          </p>
          <p className="text-[11px] text-[#8793AB]">(Tối đa 5MB, JPG/PNG/WEBP)</p>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl(null)}
              className="mt-1 text-[11px] font-semibold text-client-danger hover:underline"
            >
              Gỡ ảnh đại diện
            </button>
          )}
          {errors.avatarUrl && (
            <p className="mt-1 text-xs text-client-danger">{errors.avatarUrl}</p>
          )}
        </div>

        {formError && <FormAlert message={formError} />}

        <FieldCard label="Họ và tên" htmlFor="profile-name" required error={errors.name}>
          <Icon name="person" className="text-[21px] text-[#007A78]" />
          <input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nhập họ và tên"
            autoComplete="name"
            className="ml-2 flex-1 bg-transparent text-[16px] font-semibold text-[#123747] placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </FieldCard>

        <FieldCard
          label="Địa chỉ Email"
          right={
            <span className="flex items-center gap-1 rounded-full bg-[#B5F4EA] px-2.5 py-1 text-[10px] font-bold text-[#00766F]">
              <Icon name="verified" filled className="text-[13px]" />
              Đã xác minh
            </span>
          }
        >
          <Icon name="mail" className="text-[20px] text-[#007A78]" />
          <span className="ml-2 flex-1 truncate text-[15px] font-medium text-[#123747]">
            {user.email}
          </span>
          <span className="text-[10px] text-[#8B94A5]">Không thể đổi</span>
        </FieldCard>

        <FieldCard label="Số điện thoại" htmlFor="profile-phone" error={errors.phoneNumber}>
          <span className="mr-3 rounded-lg bg-[#EDF0FF] px-2.5 py-2 text-[12px] font-bold text-[#405A82]">
            VN
          </span>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ví dụ 0912345678 hoặc +84912345678"
            autoComplete="tel"
            className="flex-1 bg-transparent text-[16px] font-semibold text-[#123747] placeholder:text-[13px] placeholder:font-normal placeholder:text-[#9CA3AF] focus:outline-none"
          />
        </FieldCard>

        <FieldCard label="Ngày sinh" htmlFor="profile-dob" error={errors.dateOfBirth}>
          <Icon name="cake" className="text-[21px] text-[#007A78]" />
          <input
            id="profile-dob"
            type="date"
            value={dateOfBirth}
            max={today()}
            onChange={(event) => setDateOfBirth(event.target.value)}
            className="ml-2 flex-1 bg-transparent text-[15px] font-semibold text-[#123747] focus:outline-none"
          />
        </FieldCard>

        <Link
          to={CLIENT_ROUTES.PREFERENCES}
          className="mt-1 flex items-center rounded-2xl bg-white px-4 py-4 hover:bg-[#F7F8FF]"
        >
          <Icon name="explore" className="text-[20px] text-[#C68B16]" />
          <span className="ml-2 flex-1">
            <span className="block text-[14px] font-bold text-[#123747]">
              Sở thích du lịch yêu thích
            </span>
            <span className="block text-[11px] text-[#77859A]">
              Trải nghiệm, ngân sách, phương tiện, phong cách
            </span>
          </span>
          <Icon name="chevron_right" className="text-[22px] text-[#7D9AA9]" />
        </Link>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-linear-to-r from-[#D6FAF6] to-[#E7E9FF] p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9EF1E7] text-[#007A78]">
            <Icon name="auto_awesome" className="text-[22px]" />
          </span>
          <p className="flex-1 text-[12px] leading-[18px] text-[#526C83]">
            Thông tin hồ sơ giúp AI thiết kế lộ trình cá nhân hóa chính xác hơn theo phong cách của
            bạn.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="mt-5 flex h-[53px] w-full items-center justify-center gap-2 rounded-full bg-[#006C64] text-[16px] font-bold text-white shadow-md hover:bg-primary-container disabled:bg-[#9EBEB9]"
        >
          {saving ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <Icon name="check_circle" className="text-[23px]" />
              Lưu thay đổi
            </>
          )}
        </button>
        <Link
          to={CLIENT_ROUTES.PROFILE}
          className="mt-3 flex h-12 items-center justify-center rounded-full bg-[#E9EBFF] text-[15px] font-semibold text-[#334E68]"
        >
          Hủy bỏ
        </Link>
      </form>
    </div>
  );
}
