import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { type FormEvent, useState } from 'react';
import { Icon } from '@/components/common';
import { useAdminProfile, useToast } from '@/hooks';
import type { AdminContactInfo } from '@/types';
import { isValidEmail, isValidPhone, VALIDATION_MESSAGES } from '@/utils/validation';
import ProfileCardHeader, { PROFILE_CARD_CLASS } from './ProfileCardHeader';
import ProfileInput from './ProfileInput';

type ContactErrors = Partial<Record<keyof AdminContactInfo, string>>;

function validate(values: AdminContactInfo): ContactErrors {
  const errors: ContactErrors = {};
  if (!values.fullName.trim())
    errors.fullName = i18n.t('profile.contactInfoCard.pleaseEnterYourFull');
  if (!isValidEmail(values.socAlertEmail)) errors.socAlertEmail = VALIDATION_MESSAGES.email;
  if (!isValidPhone(values.hotline)) errors.hotline = VALIDATION_MESSAGES.phone;
  return errors;
}

export default function ContactInfoCard({ roleTitle }: { roleTitle: string }) {
  const { t } = useTranslation();
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
      showToast(t('profile.contactInfoCard.pleaseCheckContactInformation'), 'error');
      return;
    }
    if (!isDirty) {
      showToast(t('profile.contactInfoCard.thereNoChangesSave'), 'info');
      return;
    }
    const cleaned = {
      fullName: values.fullName.trim(),
      socAlertEmail: values.socAlertEmail.trim(),
      hotline: values.hotline.trim(),
    };
    updateContact(cleaned);
    setValues(cleaned);
    showToast(t('profile.contactInfoCard.contactInformationSavedSuccessfully'));
  };

  const handleReset = () => {
    setValues(saved);
    setErrors({});
  };

  return (
    <div className={PROFILE_CARD_CLASS}>
      <ProfileCardHeader
        icon="badge"
        title={t('profile.contactInfoCard.editContactInformation')}
        description={t('profile.contactInfoCard.updateIdentityShownOperational')}
      />
      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit} onReset={handleReset}>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label={t('profile.contactInfoCard.administratorFullName')}
            icon="person"
            value={values.fullName}
            autoComplete="name"
            error={errors.fullName}
            onChange={(value) => change('fullName', value)}
          />
          <ProfileInput
            label={t('profile.contactInfoCard.jobTitle')}
            icon="military_tech"
            value={roleTitle}
            readOnly
          />
        </div>
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label={t('profile.contactInfoCard.emergencyNotificationEmailSoc')}
            icon="alternate_email"
            type="email"
            value={values.socAlertEmail}
            error={errors.socAlertEmail}
            onChange={(value) => change('socAlertEmail', value)}
          />
          <ProfileInput
            label={t('profile.contactInfoCard.operationsHotlinePhoneNumber')}
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
            {t('profile.contactInfoCard.discardChanges')}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          >
            <Icon name="check_circle" className="text-[18px]" />
            {t('profile.contactInfoCard.updateInformation')}
          </button>
        </div>
      </form>
    </div>
  );
}
