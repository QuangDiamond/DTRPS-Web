import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/components/common';
import type { SettingsSectionMeta } from '@/types';
import { formatTimestamp } from '@/utils/format';
import type { FieldError } from '@/pages/SystemSettings/systemSettingsUtils';

/** Khung một phần cài đặt: tiêu đề, ai lưu lần cuối, nội dung, thanh Lưu / Huỷ */
export function SettingsCard({
  title,
  subtitle,
  icon,
  meta,
  dirty,
  saving,
  remoteChanged,
  badge,
  onSave,
  onDiscard,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  meta: SettingsSectionMeta;
  dirty: boolean;
  saving: boolean;
  /** Admin khác vừa lưu trong lúc mình đang sửa */
  remoteChanged: boolean;
  badge?: ReactNode;
  onSave: () => void;
  onDiscard: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-surface-container px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name={icon} className="text-[22px]" />
          </span>
          <div>
            <h2 className="flex flex-wrap items-center gap-2 font-headline-sm text-[18px] font-bold text-on-surface">
              {title}
              {badge}
            </h2>
            <p className="mt-0.5 max-w-2xl font-body-sm text-body-sm text-on-surface-variant">
              {subtitle}
            </p>
          </div>
        </div>
        <p className="flex shrink-0 items-center gap-1 font-label-sm text-[12px] text-outline">
          <Icon name="schedule" className="text-[15px]" />
          {meta.updatedAt
            ? meta.updatedBy
              ? t('systemSettings.form.lastUpdated', {
                  time: formatTimestamp(meta.updatedAt),
                  name: meta.updatedBy,
                })
              : t('systemSettings.form.lastUpdatedNoName', { time: formatTimestamp(meta.updatedAt) })
            : t('systemSettings.form.defaults')}
        </p>
      </div>

      {remoteChanged && (
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-6 py-3 font-body-sm text-body-sm text-amber-900">
          <Icon name="sync_problem" className="mt-0.5 text-[18px]" />
          {t('systemSettings.form.remoteChanged')}
        </div>
      )}

      <div className="px-6 py-6">{children}</div>

      <div className="flex flex-col-reverse gap-3 border-t border-surface-container bg-surface-container-low/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`flex items-center gap-1.5 font-label-sm text-label-sm ${
            dirty ? 'text-amber-700' : 'text-outline'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${dirty ? 'bg-amber-500' : 'bg-outline-variant'}`}
          />
          {dirty ? t('systemSettings.form.unsaved') : t('systemSettings.form.noChanges')}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            icon="undo"
            disabled={(!dirty && !remoteChanged) || saving}
            onClick={onDiscard}
          >
            {t('systemSettings.form.discard')}
          </Button>
          <Button type="submit" icon="save" loading={saving} disabled={!dirty || saving}>
            {saving ? t('systemSettings.form.saving') : t('systemSettings.form.save')}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Nhãn + gợi ý + lỗi của một ô; lỗi thay chỗ gợi ý để form không nhảy */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  aside,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: FieldError;
  required?: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-label-md text-label-md font-semibold text-on-surface">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-start gap-1 font-body-sm text-[12px] text-error"
        >
          <Icon name="error" className="mt-px text-[14px]" />
          {t(error.key, error.values)}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="font-body-sm text-[12px] text-on-surface-variant">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
