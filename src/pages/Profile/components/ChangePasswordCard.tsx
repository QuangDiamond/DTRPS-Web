import { useTranslation } from 'react-i18next';
import { type FormEvent, useState } from 'react';
import { Icon } from '@/components/common';
import { PASSWORD_ROTATION_DAYS } from '@/constants/adminProfile';
import { useAdminProfile, useToast } from '@/hooks';
import { daysSince, getPasswordStrength } from '@/pages/Profile/profileUtils';
import { getErrorMessage } from '@/utils/error';
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
  const { t } = useTranslation();
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
    if (!form.current) nextErrors.current = t('profile.changePasswordCard.pleaseEnterYourCurrent');
    if (strength.score < STRENGTH_SEGMENTS) {
      nextErrors.next = t('profile.changePasswordCard.theNewPasswordNeeds');
    } else if (form.next === form.current) {
      nextErrors.next = t('profile.changePasswordCard.theNewPasswordMust');
    }
    if (!form.confirm || form.confirm !== form.next)
      nextErrors.confirm = t('profile.changePasswordCard.theConfirmationPasswordDoes');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await changePassword(form.current, form.next);
      setForm(EMPTY_FORM);
      setShowCurrent(false);
      showToast(t('profile.changePasswordCard.administratorPasswordChangedSuccessfully'));
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
        title={t('profile.changePasswordCard.changeAccountPassword')}
        description={t('profile.changePasswordCard.weRecommendChangingYour', {
          PASSWORD_ROTATION_DAYS,
        })}
      />
      <form className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
        <ProfileInput
          label={t('profile.changePasswordCard.currentPassword')}
          icon="key"
          type={showCurrent ? 'text' : 'password'}
          autoComplete="current-password"
          value={form.current}
          error={errors.current}
          onChange={(value) => change('current', value)}
          trailing={
            <button
              type="button"
              title={
                showCurrent
                  ? t('profile.changePasswordCard.hidePassword')
                  : t('profile.changePasswordCard.showPassword')
              }
              onClick={() => setShowCurrent((value) => !value)}
              className="text-outline transition-colors hover:text-on-surface"
            >
              <Icon name={showCurrent ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
          <ProfileInput
            label={t('profile.changePasswordCard.newPassword')}
            icon="lock_reset"
            type="password"
            autoComplete="new-password"
            value={form.next}
            error={errors.next}
            onChange={(value) => change('next', value)}
          />
          <ProfileInput
            label={t('profile.changePasswordCard.confirmNewPassword')}
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
            <span className="text-on-surface-variant">
              {t('profile.changePasswordCard.passwordStrength')}
            </span>
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
            {t('profile.changePasswordCard.includeUppercaseLowercaseNumbers')}{' '}
            {passwordAge === 0
              ? t('profile.changePasswordCard.today')
              : t('profile.changePasswordCard.daysAgo', { count: passwordAge })}
            .
          </span>
        </div>

        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:cursor-wait disabled:opacity-70"
          >
            <Icon
              name={submitting ? 'progress_activity' : 'vpn_key'}
              className={`text-[18px] ${submitting ? 'animate-spin' : ''}`}
            />
            {submitting
              ? t('profile.changePasswordCard.verifying')
              : t('profile.changePasswordCard.changePassword')}
          </button>
        </div>
      </form>
    </div>
  );
}
