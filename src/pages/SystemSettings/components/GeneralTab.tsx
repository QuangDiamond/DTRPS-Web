import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks';
import {
  describedBy,
  hasErrors,
  inputClass,
  validateGeneral,
} from '@/pages/SystemSettings/systemSettingsUtils';
import { systemAdminService } from '@/services/systemAdminService';
import type { GeneralSettingsForm, PlatformSettingsView } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { Field, SettingsCard } from './FormParts';

const same = (a: GeneralSettingsForm, b: GeneralSettingsForm) =>
  a.siteName === b.siteName &&
  a.supportEmail === b.supportEmail &&
  a.supportPhone === b.supportPhone &&
  (a.supportHours ?? '') === (b.supportHours ?? '');

/** Tên hệ thống, email / hotline / giờ hỗ trợ */
export default function GeneralTab({
  view,
  onSaved,
  onDirtyChange,
}: {
  view: PlatformSettingsView;
  onSaved: (view: PlatformSettingsView) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [base, setBase] = useState(view.general);
  const [draft, setDraft] = useState<GeneralSettingsForm>({
    ...view.general,
    supportHours: view.general.supportHours ?? '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof GeneralSettingsForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstInvalid = useRef<HTMLInputElement | null>(null);

  const dirty = !same(draft, base);
  const remoteChanged = dirty && !same(view.general, base);
  const errors = useMemo(() => validateGeneral(draft), [draft]);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Bản mới từ máy chủ (mình hoặc admin khác lưu) — chỉ áp khi không đang sửa
  useEffect(() => {
    if (!dirty) {
      setBase(view.general);
      setDraft({ ...view.general, supportHours: view.general.supportHours ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.general]);

  const show = (field: keyof GeneralSettingsForm) =>
    (submitted || touched[field]) && errors[field] ? errors[field] : undefined;

  const update = (field: keyof GeneralSettingsForm, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const discard = () => {
    setBase(view.general);
    setDraft({ ...view.general, supportHours: view.general.supportHours ?? '' });
    setTouched({});
    setSubmitted(false);
  };

  const save = async () => {
    setSubmitted(true);
    if (hasErrors(errors)) {
      showToast(t('systemSettings.form.fixErrors'), 'error');
      firstInvalid.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const next = await systemAdminService.saveGeneral({
        siteName: draft.siteName.trim(),
        supportEmail: draft.supportEmail.trim(),
        supportPhone: draft.supportPhone.trim(),
        supportHours: draft.supportHours.trim(),
      });
      setBase(next.general);
      setDraft({ ...next.general, supportHours: next.general.supportHours ?? '' });
      setTouched({});
      setSubmitted(false);
      onSaved(next);
      showToast(t('systemSettings.form.saved'));
    } catch (failure) {
      showToast(getErrorMessage(failure), 'error');
    } finally {
      setSaving(false);
    }
  };

  const fields: {
    field: keyof GeneralSettingsForm;
    type: string;
    autoComplete: string;
    maxLength: number;
    required: boolean;
    inputMode?: 'email' | 'tel';
  }[] = [
    { field: 'siteName', type: 'text', autoComplete: 'organization', maxLength: 60, required: true },
    {
      field: 'supportEmail',
      type: 'email',
      autoComplete: 'email',
      maxLength: 120,
      required: true,
      inputMode: 'email',
    },
    {
      field: 'supportPhone',
      type: 'tel',
      autoComplete: 'tel',
      maxLength: 20,
      required: true,
      inputMode: 'tel',
    },
    { field: 'supportHours', type: 'text', autoComplete: 'off', maxLength: 60, required: false },
  ];
  const firstErrorField = fields.find(({ field }) => show(field))?.field;

  return (
    <SettingsCard
      title={t('systemSettings.general.title')}
      subtitle={t('systemSettings.general.subtitle')}
      icon="info"
      meta={view.generalMeta}
      dirty={dirty}
      saving={saving}
      remoteChanged={remoteChanged}
      onSave={() => void save()}
      onDiscard={discard}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map(({ field, type, autoComplete, maxLength, required, inputMode }) => {
          const id = `general-${field}`;
          const error = show(field);
          const hint = t(`systemSettings.general.${field}Hint`);
          return (
            <Field
              key={field}
              id={id}
              label={t(`systemSettings.general.${field}`)}
              hint={hint}
              error={error}
              required={required}
            >
              <input
                id={id}
                ref={field === firstErrorField ? firstInvalid : undefined}
                type={type}
                inputMode={inputMode}
                autoComplete={autoComplete}
                maxLength={maxLength}
                value={draft[field]}
                onChange={(event) => update(field, event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
                className={inputClass(Boolean(error))}
                {...describedBy(id, Boolean(error), Boolean(hint))}
              />
            </Field>
          );
        })}
      </div>
    </SettingsCard>
  );
}
