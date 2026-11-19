import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { useToast } from '@/hooks';
import {
  describedBy,
  fromRuleDraft,
  hasErrors,
  inputClass,
  RULE_LIMITS,
  type RuleDraft,
  toRuleDraft,
  validateRules,
} from '@/pages/SystemSettings/systemSettingsUtils';
import { systemAdminService } from '@/services/systemAdminService';
import type { PlatformSettingsView, RuleSettingsForm } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { Field, SettingsCard } from './FormParts';

type RuleField = keyof RuleSettingsForm;

const GROUPS: {
  titleKey: 'systemSettings.rules.groupPhotos' | 'systemSettings.rules.groupAds';
  icon: string;
  fields: { field: RuleField; unit: 'images' | 'mb' | 'days' | 'minutes' }[];
}[] = [
  {
    titleKey: 'systemSettings.rules.groupPhotos',
    icon: 'photo_library',
    fields: [
      { field: 'maxPlaceImages', unit: 'images' },
      { field: 'maxImageMb', unit: 'mb' },
    ],
  },
  {
    titleKey: 'systemSettings.rules.groupAds',
    icon: 'campaign',
    fields: [
      { field: 'renewalNoticeDays', unit: 'days' },
      { field: 'paymentLinkMinutes', unit: 'minutes' },
    ],
  },
];

const sameDraft = (a: RuleDraft, b: RuleDraft) =>
  (Object.keys(a) as RuleField[]).every((field) => a[field].trim() === b[field].trim());

/** Giới hạn ảnh, nhắc gia hạn, thời hạn link thanh toán — BE đọc lại ngay sau khi lưu */
export default function RulesTab({
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
  const [base, setBase] = useState(() => toRuleDraft(view.rules));
  const [draft, setDraft] = useState(() => toRuleDraft(view.rules));
  const [touched, setTouched] = useState<Partial<Record<RuleField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const firstInvalid = useRef<HTMLInputElement | null>(null);

  const serverDraft = useMemo(() => toRuleDraft(view.rules), [view.rules]);
  const dirty = !sameDraft(draft, base);
  const remoteChanged = dirty && !sameDraft(serverDraft, base);
  const errors = useMemo(() => validateRules(draft), [draft]);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) {
      setBase(serverDraft);
      setDraft(serverDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDraft]);

  const show = (field: RuleField) =>
    (submitted || touched[field]) && errors[field] ? errors[field] : undefined;

  const discard = () => {
    setBase(serverDraft);
    setDraft(serverDraft);
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
      const next = await systemAdminService.saveRules(fromRuleDraft(draft));
      const saved = toRuleDraft(next.rules);
      setBase(saved);
      setDraft(saved);
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

  const order = GROUPS.flatMap((group) => group.fields.map(({ field }) => field));
  const firstErrorField = order.find((field) => show(field));

  return (
    <SettingsCard
      title={t('systemSettings.rules.title')}
      subtitle={t('systemSettings.rules.subtitle')}
      icon="rule"
      meta={view.rulesMeta}
      dirty={dirty}
      saving={saving}
      remoteChanged={remoteChanged}
      onSave={() => void save()}
      onDiscard={discard}
    >
      <div className="flex flex-col gap-8">
        {GROUPS.map((group) => (
          <section key={group.titleKey} className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 font-label-md text-label-md font-bold tracking-wide text-on-surface-variant uppercase">
              <Icon name={group.icon} className="text-[18px]" />
              {t(group.titleKey)}
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              {group.fields.map(({ field, unit }) => {
                const id = `rules-${field}`;
                const error = show(field);
                const { min, max } = RULE_LIMITS[field];
                const hint = t(`systemSettings.rules.${field}Hint`);
                return (
                  <Field
                    key={field}
                    id={id}
                    label={t(`systemSettings.rules.${field}`)}
                    hint={hint}
                    error={error}
                    required
                  >
                    <div className="relative">
                      <input
                        id={id}
                        ref={field === firstErrorField ? firstInvalid : undefined}
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={max}
                        step={1}
                        value={draft[field]}
                        onChange={(event) =>
                          setDraft((current) => ({ ...current, [field]: event.target.value }))
                        }
                        onBlur={() => setTouched((current) => ({ ...current, [field]: true }))}
                        // Chặn e, +, -, dấu thập phân mà ô number vẫn cho gõ
                        onKeyDown={(event) => {
                          if (['e', 'E', '+', '-', '.', ','].includes(event.key))
                            event.preventDefault();
                        }}
                        className={`${inputClass(Boolean(error))} pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                        {...describedBy(id, Boolean(error), Boolean(hint))}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-label-md text-label-md text-outline">
                        {t(`systemSettings.rules.units.${unit}`)}
                      </span>
                    </div>
                  </Field>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </SettingsCard>
  );
}
