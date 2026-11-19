import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, ToggleSwitch } from '@/components/common';
import { useToast } from '@/hooks';
import {
  ANNOUNCEMENT_LEVELS,
  type AnnouncementDraft,
  describedBy,
  fromAnnouncementDraft,
  hasErrors,
  inputClass,
  LEVEL_STYLE,
  MESSAGE_MAX,
  toAnnouncementDraft,
  validateAnnouncement,
} from '@/pages/SystemSettings/systemSettingsUtils';
import { systemAdminService } from '@/services/systemAdminService';
import type { AnnouncementAudience, AnnouncementState, PlatformSettingsView } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { Field, SettingsCard } from './FormParts';

const AUDIENCES: AnnouncementAudience[] = ['ALL', 'TRAVELLER', 'PARTNER'];

const STATE_STYLE: Record<AnnouncementState, string> = {
  OFF: 'bg-surface-container-high text-on-surface-variant',
  SCHEDULED: 'bg-sky-100 text-sky-800',
  LIVE: 'bg-emerald-100 text-emerald-800',
  ENDED: 'bg-amber-100 text-amber-800',
};

const sameDraft = (a: AnnouncementDraft, b: AnnouncementDraft) =>
  a.enabled === b.enabled &&
  a.message.trim() === b.message.trim() &&
  a.level === b.level &&
  a.audience === b.audience &&
  a.startsAt === b.startsAt &&
  a.endsAt === b.endsAt;

/** Banner toàn hệ thống: nội dung, mức độ, đối tượng, thời gian hiện */
export default function AnnouncementTab({
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
  const serverDraft = useMemo(() => toAnnouncementDraft(view.announcement), [view.announcement]);
  const [base, setBase] = useState(serverDraft);
  const [draft, setDraft] = useState(serverDraft);
  const [touched, setTouched] = useState<Partial<Record<keyof AnnouncementDraft, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const dirty = !sameDraft(draft, base);
  const remoteChanged = dirty && !sameDraft(serverDraft, base);
  const errors = useMemo(() => validateAnnouncement(draft), [draft]);

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) {
      setBase(serverDraft);
      setDraft(serverDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverDraft]);

  const show = (field: keyof AnnouncementDraft) =>
    (submitted || touched[field]) && errors[field] ? errors[field] : undefined;
  const touch = (field: keyof AnnouncementDraft) =>
    setTouched((current) => ({ ...current, [field]: true }));

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
      if (errors.message) messageRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      const next = await systemAdminService.saveAnnouncement(fromAnnouncementDraft(draft));
      const saved = toAnnouncementDraft(next.announcement);
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

  const messageError = show('message');
  const startsError = show('startsAt');
  const endsError = show('endsAt');
  const length = draft.message.trim().length;
  const style = LEVEL_STYLE[draft.level];

  return (
    <SettingsCard
      title={t('systemSettings.announcement.title')}
      subtitle={t('systemSettings.announcement.subtitle')}
      icon="campaign"
      meta={view.announcementMeta}
      dirty={dirty}
      saving={saving}
      remoteChanged={remoteChanged}
      badge={
        <span
          className={`rounded-full px-2.5 py-0.5 font-label-sm text-[11px] font-bold ${STATE_STYLE[view.announcementState]}`}
        >
          {t(`systemSettings.announcement.states.${view.announcementState}`)}
        </span>
      }
      onSave={() => void save()}
      onDiscard={discard}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3">
          <div>
            <p className="font-label-md text-label-md font-semibold text-on-surface">
              {t('systemSettings.announcement.enabled')}
            </p>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {t('systemSettings.announcement.enabledHint')}
            </p>
          </div>
          <ToggleSwitch
            checked={draft.enabled}
            label={t('systemSettings.announcement.enabled')}
            onChange={(enabled) => setDraft((current) => ({ ...current, enabled }))}
          />
        </div>

        <Field
          id="announcement-message"
          label={t('systemSettings.announcement.message')}
          error={messageError}
          required={draft.enabled}
          aside={
            <span
              className={`font-label-sm text-[12px] ${length > MESSAGE_MAX ? 'text-error' : 'text-outline'}`}
            >
              {t('systemSettings.announcement.messageCount', { count: length })}
            </span>
          }
        >
          <textarea
            id="announcement-message"
            ref={messageRef}
            rows={3}
            value={draft.message}
            placeholder={t('systemSettings.announcement.messagePlaceholder')}
            onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
            onBlur={() => touch('message')}
            className={`${inputClass(Boolean(messageError))} resize-y`}
            {...describedBy('announcement-message', Boolean(messageError), false)}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 font-label-md text-label-md font-semibold text-on-surface">
              {t('systemSettings.announcement.level')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {ANNOUNCEMENT_LEVELS.map((level) => (
                <label
                  key={level}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-label-md text-label-md transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 ${
                    draft.level === level
                      ? `${LEVEL_STYLE[level].box} font-semibold`
                      : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="announcement-level"
                    value={level}
                    checked={draft.level === level}
                    onChange={() => setDraft((current) => ({ ...current, level }))}
                    className="sr-only"
                  />
                  <Icon name={LEVEL_STYLE[level].icon} className="text-[16px]" />
                  {t(`systemSettings.announcement.levels.${level}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 font-label-md text-label-md font-semibold text-on-surface">
              {t('systemSettings.announcement.audience')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((audience) => (
                <label
                  key={audience}
                  className={`flex cursor-pointer items-center rounded-full border px-3 py-1.5 font-label-md text-label-md transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 ${
                    draft.audience === audience
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="announcement-audience"
                    value={audience}
                    checked={draft.audience === audience}
                    onChange={() => setDraft((current) => ({ ...current, audience }))}
                    className="sr-only"
                  />
                  {t(`systemSettings.announcement.audiences.${audience}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            id="announcement-starts"
            label={t('systemSettings.announcement.startsAt')}
            hint={t('systemSettings.announcement.startsAtHint')}
            error={startsError}
          >
            <input
              id="announcement-starts"
              type="datetime-local"
              value={draft.startsAt}
              onChange={(event) =>
                setDraft((current) => ({ ...current, startsAt: event.target.value }))
              }
              onBlur={() => touch('startsAt')}
              className={inputClass(Boolean(startsError))}
              {...describedBy('announcement-starts', Boolean(startsError), true)}
            />
          </Field>
          <Field
            id="announcement-ends"
            label={t('systemSettings.announcement.endsAt')}
            hint={t('systemSettings.announcement.endsAtHint')}
            error={endsError}
          >
            <input
              id="announcement-ends"
              type="datetime-local"
              value={draft.endsAt}
              min={draft.startsAt || undefined}
              onChange={(event) =>
                setDraft((current) => ({ ...current, endsAt: event.target.value }))
              }
              onBlur={() => touch('endsAt')}
              className={inputClass(Boolean(endsError))}
              {...describedBy('announcement-ends', Boolean(endsError), true)}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-label-md text-label-md font-semibold text-on-surface">
            {t('systemSettings.announcement.preview')}
          </p>
          <div
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 font-body-sm text-body-sm ${style.box} ${
              draft.enabled ? '' : 'opacity-50'
            }`}
          >
            <Icon name={style.icon} filled className="mt-px text-[18px]" />
            <span className="min-w-0 flex-1 break-words">
              {draft.message.trim() || t('systemSettings.announcement.messagePlaceholder')}
            </span>
            <Icon name="close" className="text-[18px] opacity-60" />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}
