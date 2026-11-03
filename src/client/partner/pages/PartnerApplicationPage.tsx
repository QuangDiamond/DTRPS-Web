import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { businessProfileApi } from '@/client/api/businessProfileApi';
import { ClientApiError, errorMessage } from '@/client/api/http';
import type { BusinessProfile, BusinessProfileInput } from '@/client/api/types';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { usePartnerProfile } from '@/client/partner/partnerProfileContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Card, FormAlert, Heading, Notice, Spinner } from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import {
  isValidEmail,
  isValidPhone,
  isValidTaxCode,
  normalizePhone,
} from '@/client/utils/validation';

type Errors = Partial<Record<keyof BusinessProfileInput, string>>;

function ApplicationForm({ existing }: { existing: BusinessProfile | null }) {
  const { user } = useClientAuth();
  const { setProfile } = usePartnerProfile();
  const navigate = useNavigate();
  const [values, setValues] = useState<BusinessProfileInput>({
    businessName: existing?.businessName ?? '',
    taxCode: existing?.taxCode ?? '',
    contactEmail: existing?.contactEmail ?? user?.email ?? '',
    contactPhone: existing?.contactPhone ?? user?.phoneNumber ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (key: keyof BusinessProfileInput) => (value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (values.businessName.trim().length < 2)
      next.businessName = 'Tên doanh nghiệp phải có ít nhất 2 ký tự';
    if (!isValidTaxCode(values.taxCode))
      next.taxCode = 'Mã số thuế gồm 10 số, hoặc 10 số kèm mã chi nhánh dạng -001';
    if (!isValidEmail(values.contactEmail)) next.contactEmail = 'Email liên hệ không hợp lệ';
    if (!isValidPhone(values.contactPhone)) next.contactPhone = 'Số điện thoại không hợp lệ';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    const input: BusinessProfileInput = {
      businessName: values.businessName.trim(),
      taxCode: values.taxCode.trim(),
      contactEmail: values.contactEmail.trim(),
      contactPhone: normalizePhone(values.contactPhone),
    };
    setBusy(true);
    try {
      const saved = existing
        ? await businessProfileApi.update(input)
        : await businessProfileApi.register(input);
      setProfile(saved);
      navigate(CLIENT_ROUTES.PARTNER, { replace: true });
    } catch (error) {
      if (error instanceof ClientApiError) setErrors(error.fieldErrors as Errors);
      setFormError(errorMessage(error));
      setBusy(false);
    }
  };

  const resubmitting = existing?.status === 'INACTIVE';
  return (
    <div className="mx-auto max-w-2xl">
      <Heading
        eyebrow="HỒ SƠ ĐĂNG KÝ"
        title={existing ? 'Thông tin doanh nghiệp' : 'Đăng ký đối tác'}
        description="Đăng ký hồ sơ doanh nghiệp một lần, sau khi được duyệt bạn có thể thêm nhiều địa điểm."
      />
      {resubmitting && existing.statusNote && (
        <Notice tone="danger">
          <strong>Góp ý của Admin:</strong> {existing.statusNote}
        </Notice>
      )}
      <form onSubmit={(event) => void submit(event)} noValidate>
        <Card className="p-5">
          {formError && <FormAlert message={formError} />}
          <Field
            label="Tên doanh nghiệp"
            icon="storefront"
            placeholder="Công ty TNHH Du lịch Hội An"
            value={values.businessName}
            onChange={update('businessName')}
            error={errors.businessName}
          />
          <Field
            label="Mã số thuế"
            icon="badge"
            inputMode="numeric"
            placeholder="4001239871"
            value={values.taxCode}
            onChange={update('taxCode')}
            error={errors.taxCode}
            hint="10 số, hoặc 10 số kèm mã chi nhánh dạng -001"
          />
          <Field
            label="Email liên hệ"
            type="email"
            placeholder="lienhe@doanhnghiep.vn"
            value={values.contactEmail}
            onChange={update('contactEmail')}
            error={errors.contactEmail}
          />
          <Field
            label="Số điện thoại liên hệ"
            icon="call"
            type="tel"
            placeholder="0905 128 991"
            value={values.contactPhone}
            onChange={update('contactPhone')}
            error={errors.contactPhone}
          />
        </Card>
        <Notice>
          {existing
            ? resubmitting
              ? 'Sau khi gửi lại, hồ sơ sẽ quay về hàng chờ để Admin xét duyệt.'
              : 'Thông tin sẽ được cập nhật ngay vào hồ sơ của bạn.'
            : 'Admin sẽ xác minh thông tin doanh nghiệp trước khi kích hoạt quyền đối tác.'}
        </Notice>
        <PrimaryButton type="submit" loading={busy}>
          {existing ? (resubmitting ? 'Gửi lại hồ sơ' : 'Lưu thay đổi') : 'Gửi hồ sơ xét duyệt'}
        </PrimaryButton>
        <SecondaryButton className="mt-3" onClick={() => navigate(CLIENT_ROUTES.PARTNER)}>
          Quay lại
        </SecondaryButton>
      </form>
    </div>
  );
}

/** /partner/apply — đăng ký mới, sửa hồ sơ đang chờ, hoặc sửa & gửi lại hồ sơ bị từ chối */
export default function PartnerApplicationPage() {
  const { profile, error } = usePartnerProfile();
  if (error) return <Navigate to={CLIENT_ROUTES.PARTNER} replace />;
  if (profile === undefined) return <Spinner />;
  // Hồ sơ bị khóa thì không sửa được (backend cũng chặn)
  if (profile?.status === 'SUSPENDED') return <Navigate to={CLIENT_ROUTES.PARTNER} replace />;
  return <ApplicationForm key={profile?.id ?? 'new'} existing={profile} />;
}
