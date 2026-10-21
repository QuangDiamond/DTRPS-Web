import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Button, Modal } from '@/components/common';
import { PARTNER_TYPE_OPTIONS, PROVINCE_OPTIONS } from '@/constants/partner';
import type { Partner, PartnerFormValues } from '@/types';
import {
  isValidEmail,
  isValidPhone,
  isValidTaxCode,
  VALIDATION_MESSAGES,
} from '@/utils/validation';

interface PartnerFormModalProps {
  /** null = thêm mới, có giá trị = chỉnh sửa */
  partner: Partner | null;
  onClose: () => void;
  onSubmit: (values: PartnerFormValues) => void;
}

type FormErrors = Partial<Record<keyof PartnerFormValues, string>>;

const FORM_ID = 'partner-form';

const EMPTY_VALUES: PartnerFormValues = {
  name: '',
  businessName: '',
  type: 'hotel',
  province: 'quangnam',
  address: '',
  representative: '',
  email: '',
  phone: '',
  taxCode: '',
};

const INPUT_CLASS =
  'h-10 w-full rounded-xl bg-surface-container-low px-3 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none';

function toFormValues(partner: Partner): PartnerFormValues {
  const { name, businessName, type, province, address, representative, email, phone, taxCode } =
    partner;
  return { name, businessName, type, province, address, representative, email, phone, taxCode };
}

function validate(values: PartnerFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = i18n.t('partners.partnerFormModal.pleaseEnterPartnerName');
  if (!values.businessName.trim())
    errors.businessName = i18n.t('partners.partnerFormModal.pleaseEnterBusinessName');
  if (!values.address.trim())
    errors.address = i18n.t('partners.partnerFormModal.pleaseEnterAddress');
  if (!values.representative.trim())
    errors.representative = i18n.t('partners.partnerFormModal.pleaseEnterRepresentative');
  if (!isValidEmail(values.email)) errors.email = VALIDATION_MESSAGES.email;
  if (!isValidPhone(values.phone)) errors.phone = VALIDATION_MESSAGES.phone;
  if (!isValidTaxCode(values.taxCode)) errors.taxCode = VALIDATION_MESSAGES.taxCode;
  return errors;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      {children}
      {error && <span className="font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

export default function PartnerFormModal({ partner, onClose, onSubmit }: PartnerFormModalProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<PartnerFormValues>(
    partner ? toFormValues(partner) : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const isEdit = partner !== null;

  const updateField = <K extends keyof PartnerFormValues>(key: K, value: PartnerFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <Modal
      title={
        isEdit
          ? t('partners.partnerFormModal.editPartner')
          : t('partners.partnerFormModal.addNewPartner')
      }
      description={
        isEdit
          ? t('partners.partnerFormModal.updateProfileDetails', { id: partner.id })
          : t('partners.partnerFormModal.newPartnersStayPending')
      }
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="neutral" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button icon={isEdit ? 'save' : 'add_business'} type="submit" form={FORM_ID}>
            {isEdit
              ? t('partners.partnerFormModal.saveChanges')
              : t('partners.partnerFormModal.addPartner')}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        noValidate
      >
        <Field label={t('partners.partnerFormModal.partnerName')} error={errors.name}>
          <input
            className={INPUT_CLASS}
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="VD: Hoi An Hospitality"
          />
        </Field>
        <Field
          label={t('partners.partnerFormModal.representativeBusinessName')}
          error={errors.businessName}
        >
          <input
            className={INPUT_CLASS}
            value={values.businessName}
            onChange={(event) => updateField('businessName', event.target.value)}
            placeholder="VD: Hoi An Garden Homestay"
          />
        </Field>
        <Field label={t('partners.partnerFormModal.businessType')}>
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.type}
            onChange={(event) => {
              const option = PARTNER_TYPE_OPTIONS.find((item) => item.value === event.target.value);
              if (option) updateField('type', option.value);
            }}
          >
            {PARTNER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('partners.partnerFormModal.provinceCity')}>
          <select
            className={`${INPUT_CLASS} cursor-pointer`}
            value={values.province}
            onChange={(event) => {
              const option = PROVINCE_OPTIONS.find((item) => item.value === event.target.value);
              if (option) updateField('province', option.value);
            }}
          >
            {PROVINCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('partners.partnerFormModal.address')} error={errors.address}>
          <input
            className={INPUT_CLASS}
            value={values.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder={t('partners.partnerFormModal.eGCamChau')}
          />
        </Field>
        <Field label={t('partners.partnerFormModal.representative')} error={errors.representative}>
          <input
            className={INPUT_CLASS}
            value={values.representative}
            onChange={(event) => updateField('representative', event.target.value)}
            placeholder={t('partners.partnerFormModal.eGNguyenVan')}
          />
        </Field>
        <Field label="Email *" error={errors.email}>
          <input
            type="email"
            className={INPUT_CLASS}
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="lienhe@doanhnghiep.vn"
          />
        </Field>
        <Field label={t('partners.partnerFormModal.phoneNumber')} error={errors.phone}>
          <input
            className={INPUT_CLASS}
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="0905 123 456"
          />
        </Field>
        <Field label={t('partners.partnerFormModal.taxCode')} error={errors.taxCode}>
          <input
            className={INPUT_CLASS}
            value={values.taxCode}
            onChange={(event) => updateField('taxCode', event.target.value)}
            placeholder={t('partners.partnerFormModal.n10Or13Digits')}
          />
        </Field>
      </form>
    </Modal>
  );
}
